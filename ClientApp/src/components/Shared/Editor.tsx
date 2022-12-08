import { KeyboardEvent, MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createEditor, BaseEditor, Descendant, Editor, Transforms, Text, Range } from "slate";
import { withHistory } from "slate-history";
import { Slate, Editable, withReact, ReactEditor, RenderLeafProps, useSlate, RenderElementProps, useSelected, useFocused } from "slate-react";

export type CustomEditorType = BaseEditor & ReactEditor;

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

export type CodeElement = {
  type: "code";
  children: Text[];
};

export type UnorderedListElement = {
  type: "unordered-list";
  children: ListItemElement[];
};

export type OrderedListElement = {
  type: "ordered-list";
  children: ListItemElement[];
};

export type ListItemElement = {
  type: "list-item";
  children: CustomText[];
};

export type MentionElement = {
  type: "mention";
  mentionType?: "user" | "machine";
  id?: number;
  children: CustomText[];
}

export type CustomElement = ParagraphElement | CodeElement | UnorderedListElement | OrderedListElement | ListItemElement | MentionElement;

export type FormattedText = {
  text: string;
  bold?: true;
  italic?: true;
  underline?: true;
  placeholder?: true;
};

export type CustomText = FormattedText;

export type BlockType = CustomElement["type"]
export type Format = keyof Omit<FormattedText, "text">;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditorType
    Element: CustomElement
    Text: CustomText
  }
};

const CustomEditor = {
  isMarkActive(editor: CustomEditorType, format: Format) {
    const marks = Editor.marks(editor);
    if (!marks) return false;
    return marks[format] === true;
  },
  toggleMark(editor: CustomEditorType, format: Format) {
    if (this.isMarkActive(editor, format))
      Editor.removeMark(editor, format);
    else
      Editor.addMark(editor, format, true);
  },
  isBlockActive(editor: CustomEditorType, format: BlockType) {
    const [match] = Editor.nodes(editor, {
      match: n => Editor.isBlock(editor, n) && n.type === format,
    });

    return !!match;
  },
  toggleBlock(editor: CustomEditorType, format: BlockType) {
    const isActive = this.isBlockActive(editor, format);

    const isList = format.endsWith("-list");

    Transforms.unwrapNodes(editor, {
      match: n => Editor.isBlock(editor, n) && n.type.endsWith("-list"),
      split: true
    });

    Transforms.setNodes(editor, {
      type: isActive ? "paragraph" : isList ? "list-item" : format
    });

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  }
};

const hotkeys: Record<string, (editor: CustomEditorType) => void> = {
  "b": editor => CustomEditor.toggleMark(editor, "bold"),
  "i": editor => CustomEditor.toggleMark(editor, "italic"),
  "u": editor => CustomEditor.toggleMark(editor, "underline"),
  "/": editor => CustomEditor.toggleBlock(editor, "code"),
};

const renderers: Record<CustomElement["type"], (props: RenderElementProps) => JSX.Element> = {
  "paragraph": props => <p {...props.attributes}>{props.children}</p>,
  "code": props => <pre {...props.attributes} className="pl-8" ><code>{props.children}</code></pre>,
  "unordered-list": props => <ul {...props.attributes} className="list-disc list-inside">{props.children}</ul>,
  "ordered-list": props => <ol {...props.attributes} className="list-decimal list-inside">{props.children}</ol>,
  "list-item": props => <li {...props.attributes} className="ml-8">{props.children}</li>,
  "mention": props => <Mention {...props} />
};

function Mention({ attributes, children, element }: RenderElementProps) {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlate();

  const sel = editor.selection;

  const el = element as MentionElement;

  const name = (el.mentionType === "user" ? users : machines).find(e => e.id === el.id)?.name || "Unknown";

  return (
    <>
    <span {...attributes} className={`bg-gray-700 px-1 rounded ${selected && focused ? "!bg-sky-500 text-white" : ""}`} contentEditable={false}>
      {children}
      {el.mentionType === "user" ? "@" : "#"}<strong>{name}</strong>
    </span>
    {selected && focused && (sel === null || Range.isCollapsed(sel)) && (
      <span contentEditable={false} className="float-left my-1 p-2 bg-gray-700 rounded">
        <h1 className="text-3xl">{name}</h1>
        <p className="text-sm italic">{el.mentionType === "user" ? "User" : "Machine"}</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi voluptatem molestias magnam eum officia placeat dolorem doloribus porro iure praesentium nesciunt quod ab blanditiis, ipsam accusamus, velit alias quia vero.
        </p>
      </span>
    )}
    </>
  )
}

const withMergeAdjacentLists = (editor: CustomEditorType) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Editor.isBlock(editor, node)) {
      const text = Editor.string(editor, path);
      const numberMatch = text.match(/^\d+\. /);
      const bulletMatch = text.match(/^[*-] /);

      if (node.type === "paragraph" && node.children.length > 0 && (numberMatch || bulletMatch)) {
        CustomEditor.toggleBlock(editor, numberMatch ? "ordered-list" : "unordered-list");

        const start = Editor.start(editor, path);
        const offset = numberMatch ? numberMatch[0].length : bulletMatch![0].length;

        Transforms.delete(editor, {
          at: {
            anchor: start,
            focus: { ...start, offset }
          }
        });

        return;
      }

      if (node.type === "ordered-list" || node.type === "unordered-list") {
        node.children.forEach(child => {
          if (Editor.isBlock(editor, child) && child.type !== "list-item") {
            Transforms.setNodes(editor, { type: "list-item" }, { at: [...path, node.children.indexOf(child)] });
          }
        });
      }

      const previous = Editor.previous(editor, { at: path });
      if (previous) {
        const [previousNode] = previous;
        if (Editor.isBlock(editor, previousNode) && node.type.endsWith("-list") && previousNode.type === node.type) {
          Transforms.mergeNodes(editor, {
            at: path,
          });
          return;
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
};

const withMentions = (editor: CustomEditorType) => {
  const { isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === "mention" ? true : isInline(element);
  }

  editor.isVoid = element => {
    return element.type === "mention" ? true : isVoid(element);
  }

  return editor;
}

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "Diana" }
];

interface Machine {
  id: number;
  name: string;
}

const machines: Machine[] = [
  { id: 1, name: "Machine 1" },
  { id: 2, name: "Machine 2" },
  { id: 3, name: "Machine 3" },
  { id: 4, name: "Machine 4" }
];

export default function RichTextEditor({ initialValue = [{ type: "paragraph", children: [{ text: "" }] }] }: { initialValue?: Descendant[] }) {
  const [editor] = useState(() => withMergeAdjacentLists(withMentions(withReact(withHistory(createEditor())))));
  const ref = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Range | undefined>();
  const [index, setIndex] = useState(0);
  const [searchType, setSearchType] = useState<"user" | "machine">("user");
  const [search, setSearch] = useState("");

  const renderLeaf = useCallback((props: RenderLeafProps) => {

    const style = {
      ...(props.leaf.bold) && { fontWeight: "bold" },
      ...(props.leaf.italic) && { fontStyle: "italic" },
      ...(props.leaf.underline) && { textDecoration: "underline" }
    };

    return (<span
      {...props.attributes}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      {props.leaf.placeholder && <span
        className="text-gray-600 absolute pointer-events-none"
        contentEditable={false}
      >
        Type @ or # to tag a user/machine
      </span>}
      {props.children}
    </span>);
  }, []);

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMachines = machines.filter(machine => machine.name.toLowerCase().includes(search.toLowerCase()));

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const parentEntry = Editor.parent(editor, editor.selection!);
    const [parent, parentPath] = parentEntry;

    if (e.ctrlKey) {
      if (e.key in hotkeys) {
        e.preventDefault();
        hotkeys[e.key](editor);
      }
      return;
    }

    const arr = searchType === "user" ? filteredUsers : filteredMachines;

    switch (e.key) {
      //@ts-ignore
      case "Enter":
        if (
          editor.selection &&
          Editor.path(editor, editor.selection).length > 0 &&
          Editor.isBlock(editor, parent) &&
          ["list-item", "code"].includes(parent.type) &&
          Editor.isEmpty(editor, parent)
        ) {
          e.preventDefault();
          CustomEditor.toggleBlock(editor, "paragraph");
          return;
        }

      // falls through
      case "Tab":
        if (target) {
          e.preventDefault();
          Transforms.select(editor, target)

          Transforms.insertNodes(editor, {
            type: "mention",
            mentionType: searchType,
            id: searchType === "user" ? filteredUsers[index].id : filteredMachines[index].id,
            children: [
              {
                text: ""
              }
            ]
          });
          Transforms.move(editor);

          setTarget(undefined)
        }
        return;

      case "ArrowDown":
        if (target) {
          e.preventDefault()
          const prevIndex = (index + 1) % arr.length
          setIndex(prevIndex)
        }
        return;

      case "ArrowUp":
        if (target) {
          e.preventDefault()
          const nextIndex = (index - 1 + arr.length) % arr.length
          setIndex(nextIndex)
        }
        return;

      case "Escape":
        e.preventDefault()
        setTarget(undefined);
        return;

      case "Backspace":
        if (editor.selection && Range.isCollapsed(editor.selection)) {
          if (editor.children.length === 1 && Editor.isBlock(editor, editor.children[0]) && editor.children[0].type === "paragraph" && Editor.string(editor, editor.selection) === "") return;
          if (!(Editor.isBlock(editor, parent))) return;

          const prevParentEntry = Editor.previous(editor, { at: parentPath });

          if (["list-item", "code"].includes(parent.type)) {
            if (Editor.isStart(editor, editor.selection.anchor, parentPath)) {
              // if (prevParent && Editor.isBlock(editor, prevParent)[0] && prevParent[0].type === parent.type && !Editor.isEmpty(editor, prevParent[0])) return;
              e.preventDefault();
              CustomEditor.toggleBlock(editor, "paragraph");
              return;
            }
          }

          if (Editor.isEmpty(editor, parent)) {
            e.preventDefault();
            // remove the block
            Transforms.removeNodes(editor, {
              at: editor.selection,
            });

            if (!prevParentEntry) return;

            const [prevParent, prevParentPath] = prevParentEntry;

            // move the cursor to the end of the previous block
            if (prevParentEntry && Editor.isBlock(editor, prevParent)) {
              const end = Editor.end(editor, prevParentPath);
              Transforms.select(editor, end);

              const nextParentEntry = Editor.next(editor, { at: prevParentPath });
              if (nextParentEntry) {
                const [nextParent, nextParentPath] = nextParentEntry;
                if (Editor.isBlock(editor, nextParent) && nextParent.type === prevParent.type) {
                  Transforms.mergeNodes(editor, {
                    at: nextParentPath
                  });
                }
              }
            }
          }
        }
        return;

      case "Delete":
        if (editor.selection) {
          // check if editor is empty
          if (editor.children.length === 1) return;
          if (!parentEntry) return;
          if (!(Editor.isBlock(editor, parent))) return;

          if (Editor.isEmpty(editor, parent)) {
            e.preventDefault();
            Transforms.removeNodes(editor, { at: parentPath });
            return;
          }
        }
        return;
    }
  }, [editor, filteredMachines, filteredUsers, index, searchType, target]);

  useEffect(() => {
    const el = ref.current;

    if (target && users.length > 0 && el) {
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [editor, index, search, target]);

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={e => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: 'word' });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.string(editor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^([@#])(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.string(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange);
            setSearchType(beforeMatch[1] === "@" ? "user" : "machine");
            setSearch(beforeMatch[2]);
            setIndex(0);
            return;
          }
        }

        setTarget(undefined);
      }}
    >
      <div className="flex flex-col w-full gap-2 p-4">
        <div className="flex gap-2">
          <FormatButton format="bold" icon="format_bold" />
          <FormatButton format="italic" icon="format_italic" />
          <FormatButton format="underline" icon="format_underline" />

          <BlockButton format="code" icon="code" />
          <BlockButton format="unordered-list" icon="format_list_bulleted" />
          <BlockButton format="ordered-list" icon="format_list_numbered" />
        </div>
        <Editable
          renderElement={props => renderers[props.element.type](props)}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          className="border border-gray-700 rounded-md p-2 selection:bg-sky-500"
          decorate={([node, path]) => (
            editor.selection != null &&
              !Editor.isEditor(node) &&
              Editor.isBlock(editor, node) &&
              Editor.isEmpty(editor, node) &&
              Range.includes(editor.selection, path) &&
              Range.isCollapsed(editor.selection)
              ? [
                {
                  ...editor.selection,
                  placeholder: true,
                },
              ] : []
          )}
        />
        {target && (searchType === "user" ? filteredUsers.length > 0 : filteredMachines.length > 0) && (
          createPortal(
            (<div
              ref={ref}
              className="absolute z-10 p-1 bg-gray-800 rounded-md shadow-lg"
              data-cy="mentions-portal"
            >
              {(searchType === "user" ? filteredUsers : filteredMachines).map((user, i) => (
                <div
                  key={user.id.toString()}
                  className={`rounded-md p-1 px-3 ${i === index ? 'bg-sky-500 text-white' : ''}`}
                >
                  {user.name}
                </div>
              ))}
            </div>)
            , document.body)
        )}
      </div>
    </Slate>
  )
}

const BlockButton = ({ format, icon }: { format: BlockType, icon?: string }) => {
  const editor = useSlate();
  return (
    <EditorButton onClick={() => CustomEditor.toggleBlock(editor, format)} active={CustomEditor.isBlockActive(editor, format)} title={format} icon={icon} />
  );
};

const FormatButton = ({ format, icon }: { format: Format, icon?: string }) => {
  const editor = useSlate();

  return (
    <EditorButton onClick={() => CustomEditor.toggleMark(editor, format)} active={CustomEditor.isMarkActive(editor, format)} title={format} icon={icon} />
  );
};

const EditorButton = ({ onClick, active, title, icon = "error" }: { onClick: MouseEventHandler<HTMLButtonElement>, active: boolean, title: string, icon?: string }) => {
  const editor = useSlate();

  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault();
        onClick(e);
        ReactEditor.focus(editor);
      }}
      className={`!p-0 w-10 h-10 grid items-center ${active ? "text-sky-600" : ""}`}
      title={title}
    >
      <span className="material-icons-round">{icon}</span>
    </button>
  );
};