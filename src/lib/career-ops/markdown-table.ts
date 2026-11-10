function getUnescapedPipeOffsets(line: string): number[] {
  const offsets: number[] = [];

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== "|") {
      continue;
    }

    let precedingBackslashes = 0;
    for (
      let backslashIndex = index - 1;
      backslashIndex >= 0 && line[backslashIndex] === "\\";
      backslashIndex -= 1
    ) {
      precedingBackslashes += 1;
    }

    if (precedingBackslashes % 2 === 0) {
      offsets.push(index);
    }
  }

  return offsets;
}

export function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function unescapeMarkdownTableCell(cell: string): string {
  return cell.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
}

export function parseMarkdownTableCells(line: string): string[] | null {
  const pipeOffsets = getUnescapedPipeOffsets(line);

  if (pipeOffsets.length < 2) {
    return null;
  }

  return pipeOffsets.slice(0, -1).map((offset, index) => {
    const endOffset = pipeOffsets[index + 1] ?? line.length;
    return line.slice(offset + 1, endOffset).trim();
  });
}

export function replaceMarkdownTableCell(
  line: string,
  columnIndex: number,
  value: string,
): string {
  const pipeOffsets = getUnescapedPipeOffsets(line);
  const startOffset = pipeOffsets[columnIndex];
  const endOffset = pipeOffsets[columnIndex + 1];

  if (startOffset === undefined || endOffset === undefined) {
    throw new Error("The table row does not match its header.");
  }

  const currentCell = line.slice(startOffset + 1, endOffset);
  const leadingWhitespace = /^\s*/.exec(currentCell)?.[0] ?? "";
  const trailingWhitespace = /\s*$/.exec(currentCell)?.[0] ?? "";
  const escapedValue = escapeMarkdownTableCell(value.trim());

  return `${line.slice(0, startOffset + 1)}${leadingWhitespace}${escapedValue}${trailingWhitespace}${line.slice(endOffset)}`;
}
