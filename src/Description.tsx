import * as React from "react";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { InputBaseComponentProps } from "@mui/material/InputBase";
import { mdStyles } from "./markdownStyles";

type RemarkPlugins = React.ComponentProps<typeof ReactMarkdown>["remarkPlugins"];

// The scrollable markdown viewport.
const markdownScrollSx: SxProps<Theme> = (theme) => ({
  "& *:first-of-type": {
    marginTop: 0,
  },
  "& *:last-of-type": {
    marginBottom: 0,
  },
  ...mdStyles(theme),
  overflowX: "hidden",
  overflowY: "auto",
  maxHeight: 400,
});

const BAND_HEIGHT = 28;

// A translucent fade band hinting at more content above/below. It fades out
// smoothly (via the opacity transition set where it's used) when scrolled to the
// corresponding extreme, so it never covers the first or last line.
const bandSx = (edge: "top" | "bottom") => (theme: Theme) => ({
  position: "absolute" as const,
  left: 0,
  right: 0,
  [edge]: 0,
  height: BAND_HEIGHT,
  pointerEvents: "none" as const,
  transition: "opacity 0.25s ease",
  background: `linear-gradient(${edge === "top" ? "to bottom" : "to top"}, ${
    theme.palette.background.paper
  }, transparent)`,
});

const markdownComponents: Components = {
  a: ({ ...props }) => <Link {...props} target="_blank" rel="noopener noreferrer" />,
};

interface MarkdownInputProps {
  remarkPlugins?: RemarkPlugins;
  components?: Components;
  children?: string;
  className?: string;
}

/**
 * Renders the description as read-only markdown inside the outlined TextField,
 * forwarding the ref that MUI's Input expects. Scroll-position-aware fade bands
 * hint at clipped content without obscuring the first/last line at the extremes.
 */
const MarkdownInput = React.forwardRef<HTMLDivElement, MarkdownInputProps>(function MarkdownInput(
  { remarkPlugins, components, children, className },
  ref,
) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [showTop, setShowTop] = React.useState(false);
  const [showBottom, setShowBottom] = React.useState(false);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  const updateBands = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTop(scrollTop > 1);
    setShowBottom(scrollTop + clientHeight < scrollHeight - 1);
  }, []);

  // Re-measure when the content changes (it may newly overflow or fit).
  React.useEffect(() => {
    updateBands();
  }, [children, updateBands]);

  return (
    <Box className={className} sx={{ position: "relative", overflow: "hidden" }}>
      <Box ref={setRefs} onScroll={updateBands} sx={markdownScrollSx}>
        <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
          {children ?? ""}
        </ReactMarkdown>
      </Box>
      <Box aria-hidden sx={[bandSx("top"), { opacity: showTop ? 1 : 0 }]} />
      <Box aria-hidden sx={[bandSx("bottom"), { opacity: showBottom ? 1 : 0 }]} />
    </Box>
  );
});

interface DescriptionProps {
  editingEnabled: boolean;
  description: string;
  onChange: (value: string) => void;
}

export function Description({ editingEnabled, description, onChange }: DescriptionProps) {
  const [localDescription, setLocalDescription] = React.useState(description);
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    setLocalDescription(description);
  }, [description]);

  return (
    <>
      {editing && (
        <TextField
          fullWidth
          multiline
          autoFocus
          label="Description"
          variant="outlined"
          sx={{ backgroundColor: "background.paper", mt: 0.5 }}
          value={localDescription}
          onChange={(evt) => setLocalDescription(evt.target.value)}
          onBlur={() => {
            const newDescription = localDescription.trim();
            setLocalDescription(newDescription);
            onChange(newDescription);
            setEditing(false);
          }}
          slotProps={{
            input: {
              sx: { fontFamily: "Roboto Mono", fontSize: (theme) => theme.typography.fontSize },
              onFocus: (evt) => (evt.target as HTMLInputElement).select(),
            },
          }}
        />
      )}
      {!editing && (
        <TextField
          fullWidth
          variant="outlined"
          multiline
          label="Description"
          value={localDescription}
          onClick={(evt) => {
            // So we can click on links in description
            if (editingEnabled && !(evt.target as HTMLAnchorElement).href) {
              setEditing(true);
            }
          }}
          sx={{ backgroundColor: "background.paper", mt: 0.5 }}
          slotProps={{
            inputLabel: { shrink: !!localDescription },
            input: {
              inputComponent:
                MarkdownInput as unknown as React.ElementType<InputBaseComponentProps>,
              inputProps: {
                remarkPlugins: [remarkGfm],
                children: localDescription || "&nbsp;",
                components: markdownComponents,
              },
            },
          }}
        />
      )}
    </>
  );
}
