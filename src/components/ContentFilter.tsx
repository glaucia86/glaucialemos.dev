"use client";

import { useState } from "react";
import type { Artigo } from "@/lib/types";

const PAGE_SIZE = 12;

type Props = {
  articles: Artigo[];
  all: string;
  label: string;
  locale: string;
  loadMore: string;
  countLabel: string;
};

export function ContentFilter({ articles, all, label, locale, loadMore, countLabel }: Props) {
  const platforms = [...new Set(articles.map((item) => item.plataforma))];
  const [active, setActive] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const filtered = active === null ? articles : articles.filter((item) => item.plataforma === active);
  const visible = filtered.slice(0, limit);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });

  const select = (platform: string | null) => {
    setActive(platform);
    setLimit(PAGE_SIZE);
  };

  return <>
    <div className="filter" role="group" aria-label={label}>
      {[null, ...platforms].map((platform) => <button
        type="button"
        aria-pressed={active === platform}
        aria-controls="artigos"
        className={active === platform ? "selected" : ""}
        onClick={() => select(platform)}
        key={platform ?? "all"}
      >{platform ?? all}</button>)}
    </div>
    <div id="artigos" className="article-list">
      {visible.map((article) => <article key={article.url}>
        <div>
          <span className="tag">{article.plataforma}</span>
          <time dateTime={article.data}>{date.format(new Date(article.data))}</time>
          <span>{article.idioma}</span>
        </div>
        <h2><a href={article.url}>{article.titulo}</a></h2>
      </article>)}
    </div>
    <div className="content-pagination">
      <p role="status">{visible.length} / {filtered.length} {countLabel}</p>
      {visible.length < filtered.length && <button className="button secondary" type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>{loadMore}</button>}
    </div>
  </>;
}
