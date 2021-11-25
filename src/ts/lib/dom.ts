/* export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document); */

const dollar = (query: string): HTMLElement | null => document.querySelector(query);
export const $ = dollar.bind(document)


function double_dollar(query: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(query);
}

export const $$ = double_dollar.bind(document)
