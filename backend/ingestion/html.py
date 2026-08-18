import re

import nh3
from bs4 import BeautifulSoup

_LEADING_CSS_BLOCKS = re.compile(r"\A(?:\s*[^{}\n]+\s*\{[^{}]*\})+\s*", re.DOTALL)


def _clean_fragment(value: str | None) -> BeautifulSoup:
    without_bare_css = _LEADING_CSS_BLOCKS.sub("", value or "")
    fragment = BeautifulSoup(without_bare_css, "html.parser")
    for element in fragment.select("script, style"):
        element.decompose()
    return fragment


def plain_text(value: str | None) -> str:
    return " ".join(_clean_fragment(value).get_text(" ", strip=True).split())


def sanitize_html(value: str | None) -> str:
    return nh3.clean(str(_clean_fragment(value)))
