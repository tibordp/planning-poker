import { useRouter } from "next/router";
import randomWords from "random-words";

const getSessionId = () =>
  randomWords({
    exactly: 1,
    wordsPerString: 3,
    separator: "-",
  })[0];

function NewSessionPage({ settings }) {
  const router = useRouter();
  if (typeof window !== "undefined") {
    const sessionName = getSessionId();
    if (settings) {
      window.sessionStorage.setItem(
        `session_data:${sessionName}`,
        JSON.stringify({
          name: null,
          score: null,
          description: "",
          epoch: 0,
          settings,
        })
      );
    }
    router.push(`/${sessionName}`);
  }

  return null;
}

NewSessionPage.getInitialProps = ({ query }) => {
  let settings;
  try {
    settings = JSON.parse(query.settings);
  } catch (e) {
    settings = null;
  }
  return { settings };
};

export default NewSessionPage;
