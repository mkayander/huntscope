import { describe, expect, it } from "vitest";

import {
  getIntrinsicElementWithOnClick,
  verifyInteractionCursors,
} from "~/lib/dom/verify-interaction-cursors";

describe("verifyInteractionCursors", () => {
  it("reports no missing cursor styling in the app source tree", () => {
    const issues = verifyInteractionCursors(process.cwd());

    expect(issues).toEqual([]);
  });

  it("flags intrinsic elements with onClick and no cursor styling", () => {
    const source = `
      export function Example() {
        return (
          <div onClick={() => undefined}>
            Click me
          </div>
        );
      }
    `;

    const onClickIndex = source.indexOf("onClick");
    const element = getIntrinsicElementWithOnClick(source, onClickIndex);

    expect(element?.tag).toBe("div");
    expect(element?.attributes.includes("cursor-pointer")).toBe(false);
  });

  it("allows clickable helper classes on intrinsic elements", () => {
    const source = `
      import { clickableCardClassName } from "~/components/ui/interaction";

      export function Example() {
        return (
          <div
            className={clickableCardClassName}
            onClick={() => undefined}
          >
            Click me
          </div>
        );
      }
    `;

    const onClickIndex = source.indexOf("onClick");
    const element = getIntrinsicElementWithOnClick(source, onClickIndex);

    expect(element?.tag).toBe("div");
    expect(element?.attributes.includes("clickableCardClassName")).toBe(true);
  });

  it("ignores onClick passed to React components", () => {
    const source = `
      export function Example() {
        return <MetricCard onClick={() => undefined} />;
      }
    `;

    const onClickIndex = source.indexOf("onClick");
    const element = getIntrinsicElementWithOnClick(source, onClickIndex);

    expect(element).toBeNull();
  });
});
