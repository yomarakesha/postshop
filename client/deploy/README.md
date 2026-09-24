# Deploy

Service runs on the server as `postshop-client.service`, listening on `:7001` (Vite dev mode).

## First-time setup on server

```bash
# Enable pnpm via corepack (user-local)
mkdir -p ~/.local/bin
corepack enable --install-directory ~/.local/bin
corepack prepare pnpm@latest --activate
export PATH=$HOME/.local/bin:$PATH

# Clone & install
cd ~
git clone https://github.com/selim-kerimov/postshop_client.git
cd postshop_client
pnpm install

# Systemd unit
sudo cp deploy/postshop-client.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now postshop-client
```

## Update

```bash
cd ~/postshop_client
git pull
pnpm install
sudo systemctl restart postshop-client
```

## Logs

```bash
journalctl -u postshop-client -f
```
