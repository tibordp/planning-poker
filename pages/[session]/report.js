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
import React from "react";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Logo from "../../src/Logo";
import Footer from "../../src/Footer";
import Skeleton from "@material-ui/lab/Skeleton";
import Link from "next/link";
import MuiLink from "@material-ui/core/Link";

import useSWR from "swr";
import { Box } from "@material-ui/core";
import { mdStyles } from "../../src/Description";
import { getPseudoMedians, makeChipStyle } from "../../src/board/MainBoard";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import TextField from "@material-ui/core/TextField";
import AlertTitle from "@material-ui/lab/AlertTitle";
import { formatDuration } from "../../src/Timer";
import { state } from "../../server/state";
import { exportSession } from "../../server/serialization";

import gfm from "remark-gfm";

const useStyles = makeStyles((theme) => ({
  chip: {
    margin: theme.spacing(1),
  },
  markdown: {
    ...mdStyles(theme),
    display: "inline-block",
    overflowX: "auto",
  },
}));

function ReportRow({ scoreSet, description, votes, index, duration }) {
  const classes = useStyles();
  const theme = useTheme();

  const allVotesCast = votes.filter((score) => scoreSet.includes(score) && score !== "Pass");

  const votesCast = new Set(allVotesCast);
  const scoreDistribution = [...votesCast]
    .map((score) => [score, allVotesCast.filter((s) => score === s).length])
    .sort((a, b) => a[0] - b[0]);
  const haveConsensus = votesCast.size === 1;
  const medians = getPseudoMedians(scoreSet, allVotesCast);
  const chipStyleMap = (vote) => {
    if (!votesCast.has(vote)) {
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
      <Box justifyContent="center" display="flex">
        <ReactMarkdown
          linkTarget="_blank"
          className={classes.markdown}
          components={{
            a: MuiLink,
          }}
          remarkPlugins={[gfm]}
        >
          {description || `### Page ${index + 1}`}
        </ReactMarkdown>
      </Box>

      <Box justifyContent="space-between" alignItems="center" display="flex" my={2}>
        <TextField
          label="Duration"
          defaultValue={formatDuration(duration)}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
          size="small"
        />
        {allVotesCast.length > 0 && (
          <Box display="inline-block">
            {[...allVotesCast].sort().map((score, index) => (
              <Chip
                key={index}
                className={classes.chip}
                size="medium"
                label={score}
                {...chipStyleMap(score)}
              />
            ))}
          </Box>
        )}
        {allVotesCast.length == 0 && (
          <Chip className={classes.chip} size="medium" label="No votes" {...chipStyleMap(null)} />
        )}
      </Box>
    </>
  );
}

ReportRow.propTypes = {
  scoreSet: PropTypes.arrayOf(PropTypes.string).isRequired,
  description: PropTypes.string,
  votes: PropTypes.arrayOf(PropTypes.string).isRequired,
  index: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
};

function Report({ sessionName, initialData }) {
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR(
    `/api/sessions/${encodeURIComponent(sessionName)}/export`,
    fetcher,
    { initialData, revalidateOnMount: true }
  );

  return (
    <>
      {error && (
        <Box my={2}>
          <Alert variant="filled" severity="error">
            <AlertTitle>Could not load the session report!</AlertTitle>
            It&apos;s your fault probably.
          </Alert>
        </Box>
      )}
      {!data && (
        <Box my={2} mx={2}>
          <Skeleton height={118} />
          <Skeleton height={118} />
          <Skeleton height={118} />
        </Box>
      )}
      {data && !data.pages && (
        <Box my={2}>
          <Alert variant="filled" severity="warning">
            <AlertTitle>Session does not exist!</AlertTitle>
            It probably expired.
          </Alert>
        </Box>
      )}
      {data && data.pages && !data.finished && (
        <Box my={2}>
          <Alert variant="filled" severity="success">
            <AlertTitle>Session is still in progress!</AlertTitle>
            Click{" "}
            <Link
              href={{
                pathname: "/[session]",
                query: { session: sessionName },
              }}
              passHref
            >
              <MuiLink>here</MuiLink>
            </Link>{" "}
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

Report.propTypes = {
  sessionName: PropTypes.string.isRequired,
  initialData: PropTypes.object,
};

function ReportPage({ sessionName, initialData }) {
  return (
    <Container maxWidth="sm">
      <Logo />
      <Report sessionName={sessionName} initialData={initialData} />
    </Container>
  );
}

ReportPage.propTypes = {
  sessionName: PropTypes.string.isRequired,
  initialData: PropTypes.object,
};

ReportPage.getInitialProps = async ({ query }) => {
  const { session: sessionName } = query;

  const session = state[sessionName];
  let initialData = null;
  if (session) {
    initialData = exportSession(session);
  }

  return { sessionName, initialData };
};

export default ReportPage;
