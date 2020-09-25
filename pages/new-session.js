import { useRouter } from "next/router";
import randomWords from "random-words";

const getSessionId = () =>
  randomWords({
    exactly: 1,
    wordsPerString: 3,
    separator: "-",
  })[0];

function NewSessionPage() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    const sessionName = getSessionId();
    router.push(`/${sessionName}`);
  }

  return null;
}

export default NewSessionPage;
