/**
 * MIT License
 *
 * Copyright (c) 2020 Tibor Djurica Potpara
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as React from "react";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Logo from "../../src/Logo";
import Footer from "../../src/Footer";
import Skeleton from "@mui/material/Skeleton";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useTheme } from "@mui/material/styles";
import useSWR from "swr";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { mdStyles } from "../../src/markdownStyles";
import { getPseudoMedians, makeChipStyle } from "../../src/board/MainBoard";
import { formatDuration } from "../../src/Timer";
import { state } from "../../server/state";
import { exportSession } from "../../server/serialization";
import type { NextPageContext } from "next";
import type { ChipStyle, ExportedSession, ScoreDistribution } from "../../src/types";

const markdownComponents: Components = {
  a: ({ ...props }) => <MuiLink {...props} target="_blank" rel="noopener noreferrer" />,
};

interface ReportRowProps {
  scoreSet: string[];
  description?: string;
  votes: string[];
  index: number;
  duration: number;
}

function ReportRow({ scoreSet, description, votes, index, duration }: ReportRowProps) {
  const theme = useTheme();

  const allVotesCast = votes.filter((score) => scoreSet.includes(score) && score !== "Pass");

  const votesCast = new Set(allVotesCast);
  const scoreDistribution: ScoreDistribution = [...votesCast]
    .map((score): [string, number] => [score, allVotesCast.filter((s) => score === s).length])
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  const haveConsensus = votesCast.size === 1;
  const medians = getPseudoMedians(scoreSet, allVotesCast);
  const chipStyleMap = (vote: string | null): ChipStyle => {
    if (vote === null || !votesCast.has(vote)) {
      return makeChipStyle(theme.palette.grey[500], false);
    } else if (haveConsensus && vote === scoreDistribution[0][0]) {
      return makeChipStyle(theme.palette.success.main, true);
    } else if (medians.includes(vote)) {
      return makeChipStyle(theme.palette.secondary.main, true);
    } else {
      return makeChipStyle(theme.palette.primary.main, false);
    }
  };

  return (
    <>
      <Box sx={{ justifyContent: "center", display: "flex" }}>
        <Box
          sx={(t) => ({ ...mdStyles(t), display: "inline-block", overflowX: "auto" })}
        >
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {description || `### Page ${index + 1}`}
          </ReactMarkdown>
        </Box>
      </Box>

      <Box sx={{ justifyContent: "space-between", alignItems: "center", display: "flex", my: 2 }}>
        <TextField
          label="Duration"
          defaultValue={formatDuration(duration)}
          slotProps={{ input: { readOnly: true } }}
          variant="outlined"
          size="small"
          sx={{ backgroundColor: "background.paper" }}
        />
        {allVotesCast.length > 0 && (
          <Box sx={{ display: "inline-block" }}>
            {[...allVotesCast].sort().map((score, idx) => (
              <Chip
                key={idx}
                sx={{ m: 1 }}
                size="medium"
                label={score}
                {...chipStyleMap(score)}
              />
            ))}
          </Box>
        )}
        {allVotesCast.length == 0 && (
          <Chip sx={{ m: 1 }} size="medium" label="No votes" {...chipStyleMap(null)} />
        )}
      </Box>
    </>
  );
}

interface ReportProps {
  sessionName: string;
  initialData: ExportedSession | null;
}

function Report({ sessionName, initialData }: ReportProps) {
  const fetcher = (url: string): Promise<ExportedSession> => fetch(url).then((r) => r.json());
  const { data, error } = useSWR<ExportedSession>(
    `/api/sessions/${encodeURIComponent(sessionName)}/export`,
    fetcher,
    { fallbackData: initialData ?? undefined, revalidateOnMount: true }
  );

  return (
    <>
      {error && (
        <Box sx={{ my: 2 }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>Could not load the session report!</AlertTitle>
            It&apos;s your fault probably.
          </Alert>
        </Box>
      )}
      {!data && (
        <Box sx={{ my: 2, mx: 2 }}>
          <Skeleton height={118} />
          <Skeleton height={118} />
          <Skeleton height={118} />
        </Box>
      )}
      {data && !data.pages && (
        <Box sx={{ my: 2 }}>
          <Alert variant="filled" severity="warning">
            <AlertTitle>Session does not exist!</AlertTitle>
            It probably expired.
          </Alert>
        </Box>
      )}
      {data && data.pages && !data.finished && (
        <Box sx={{ my: 2 }}>
          <Alert variant="filled" severity="success">
            <AlertTitle>Session is still in progress!</AlertTitle>
            Click{" "}
            <MuiLink
              component={Link}
              href={{
                pathname: "/[session]",
                query: { session: sessionName },
              }}
            >
              here
            </MuiLink>{" "}
            to join.
          </Alert>
        </Box>
      )}
      {data &&
        data.finished &&
        data.pages &&
        data.pages.map((page, index) => (
          <React.Fragment key={index}>
            <Divider />
            <ReportRow
              scoreSet={data.settings.scoreSet}
              votes={Object.values(page.votes)}
              description={page.description}
              duration={page.duration}
              index={index}
            />
          </React.Fragment>
        ))}
      <Footer canReactivate={!!(data && data.finished && data.pages)} sessionName={sessionName} />
    </>
  );
}

interface ReportPageProps {
  sessionName: string;
  initialData: ExportedSession | null;
}

function ReportPage({ sessionName, initialData }: ReportPageProps) {
  return (
    <Container maxWidth="sm">
      <Logo />
      <Report sessionName={sessionName} initialData={initialData} />
    </Container>
  );
}

ReportPage.getInitialProps = async ({ query }: NextPageContext): Promise<ReportPageProps> => {
  const sessionName = String(query.session);

  const session = state[sessionName];
  let initialData: ExportedSession | null = null;
  if (session) {
    initialData = exportSession(session);
  }

  return { sessionName, initialData };
};

export default ReportPage;
