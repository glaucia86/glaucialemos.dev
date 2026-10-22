import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { AnimatedNumber } from "@/components/AnimatedNumber";

it("entrega o total real antes da hidratação, inclusive sem JavaScript", () => {
  const html = renderToStaticMarkup(createElement(AnimatedNumber, { value: 105 }));
  expect(html).toContain("105");
});
