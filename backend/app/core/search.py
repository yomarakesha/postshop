"""
Фильтр списков по названию.

Из четырнадцати списков в админке поле поиска было только у категорий,
магазинов и заказов — у остальных его не было, при том что строки-подсказки для
него в локализации уже лежали. Причина глубже интерфейса: у списочных методов
не было и параметра, по которому искать. Поиск заказов поэтому работал на
клиенте по двумстам последним записям, а найти запись за пределами первой
страницы было нельзя вообще.

Здесь собраны два условия, покрывающие все справочники: поиск по таблице
переводов (страна, регион, город, валюта, единица измерения, подборка, пункт
выдачи) и поиск по обычному текстовому полю (код валюты, имя пользователя,
название баннера).
"""

from typing import Optional

from sqlalchemy import exists, or_


def translation_matches(translation_model, owner_id_column, term: str):
    """
    EXISTS-условие: у записи есть перевод, чьё название содержит `term`.

    Сделано через EXISTS, а не JOIN: у записи несколько переводов, и соединение
    размножило бы строки, сломав постраничную выдачу и подсчёт X-Total-Count.
    """
    like = f"%{term}%"
    return exists().where(
        (translation_model.__table__.c[_owner_column_name(translation_model)] == owner_id_column)
        & (translation_model.name.ilike(like))
    )


def _owner_column_name(translation_model) -> str:
    """Имя колонки-владельца в таблице переводов: country_id, city_id и так далее."""
    for column in translation_model.__table__.columns:
        name = column.name
        if name.endswith("_id") and name != "id":
            return name
    raise ValueError(f"{translation_model.__name__}: не найдена колонка владельца")


def text_matches(term: str, *columns):
    """Условие «хотя бы одно из полей содержит `term`». Пустые поля пропускаются."""
    like = f"%{term}%"
    return or_(*[column.ilike(like) for column in columns])


def normalize_term(term: Optional[str]) -> Optional[str]:
    """Пустая строка и пробелы — это отсутствие фильтра, а не поиск пустоты."""
    if term is None:
        return None
    cleaned = term.strip()
    return cleaned or None
