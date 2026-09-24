import * as FileSystem from "expo-file-system/legacy";

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToUint8Array(base64: string): Uint8Array {
  const cleaned = base64.replace(/=+$/, "");
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE64_CHARS.indexOf(cleaned[i]);
    if (val === -1) continue;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

/** Одно поле формы: имя и значение. Имя может повторяться. */
type MultipartField = [string, string | number | undefined | null];

type MultipartFile = {
  fieldName: string;
  uri: string;
  filename: string;
  mimeType: string;
};

const isFile = (v: unknown): v is { uri: string; name?: string; type?: string } =>
  !!v && typeof v === "object" && "uri" in (v as any);

/**
 * Drop-in замена formDataBodySerializer. Принимает тот же вид тела
 * (объект с полями, где файлы — {uri, name, type}, массивы файлов
 * поддерживаются), но вместо FormData собирает multipart-тело вручную
 * в виде байт — в обход сломанного RN Blob-моста (см. buildMultipartBody).
 */
export const buildMultipartFromBody = async (
  body: Record<string, unknown>,
): Promise<{ body: Uint8Array; contentType: string }> => {
  // Пары, а не объект: у одного поля может быть несколько значений —
  // например kinds при загрузке документов, по виду на каждый файл.
  const fields: MultipartField[] = [];
  const files: MultipartFile[] = [];

  Object.entries(body).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    const values = Array.isArray(value) ? value : [value];

    values.forEach((v) => {
      if (v === null || v === undefined) return;

      if (isFile(v)) {
        files.push({
          fieldName: key,
          uri: v.uri,
          filename: v.name ?? v.uri.split("/").pop() ?? "file",
          mimeType: v.type ?? "application/octet-stream",
        });
      } else if (typeof v === "object") {
        fields.push([key, JSON.stringify(v)]);
      } else {
        // Массив простых значений разворачивается в повторяющиеся поля:
        // FastAPI собирает из них список (kinds=…&kinds=…). Одной строкой
        // JSON он бы их не принял.
        fields.push([key, String(v)]);
      }
    });
  });

  return buildMultipartBody(fields, files);
};

/**
 * Собирает multipart/form-data тело вручную, читая файлы через expo-file-system
 * и кодируя их в чистые байты в JS. Это обходит сломанный React Native
 * Blob-мост (FormData.append({uri, name, type}) не работает на RN 0.83+
 * с новой архитектурой — см. facebook/react-native#54881, #55841, #56404).
 */
export const buildMultipartBody = async (
  fields: MultipartField[] | Record<string, string | number | undefined | null>,
  files: MultipartFile[],
): Promise<{ body: Uint8Array; contentType: string }> => {
  const boundary = `Boundary${Date.now()}${Math.random().toString(16).slice(2)}`;
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const CRLF = "\r\n";

  const pushText = (text: string) => chunks.push(encoder.encode(text));

  const pairs = Array.isArray(fields) ? fields : Object.entries(fields);

  for (const [name, value] of pairs) {
    if (value === undefined || value === null) continue;
    pushText(`--${boundary}${CRLF}`);
    pushText(`Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}`);
    pushText(`${String(value)}${CRLF}`);
  }

  for (const file of files) {
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = base64ToUint8Array(base64);

    pushText(`--${boundary}${CRLF}`);
    pushText(
      `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"${CRLF}`,
    );
    pushText(`Content-Type: ${file.mimeType}${CRLF}${CRLF}`);
    chunks.push(bytes);
    pushText(CRLF);
  }

  pushText(`--${boundary}--${CRLF}`);

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const body = new Uint8Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    body.set(c, offset);
    offset += c.length;
  }

  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
};