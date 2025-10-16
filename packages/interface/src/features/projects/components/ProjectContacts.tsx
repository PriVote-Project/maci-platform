import { FaGithub, FaEthereum } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";

import { Link } from "~/components/ui/Link";
import { prefixes } from "~/config";
import { extractHandle } from "~/utils/extractHandle";

interface IProjectContactsProps {
  author?: string;
  website?: string;
  github?: string;
  twitter?: string;
}

export const ProjectContacts = ({
  author = undefined,
  website = undefined,
  github = undefined,
  twitter = undefined,
}: IProjectContactsProps): JSX.Element => {
  // Extract handles from potential URLs
  const twitterHandle = twitter ? extractHandle(twitter, "twitter") : undefined;
  const githubHandle = github ? extractHandle(github, "github") : undefined;

  return (
    <div className="grid w-full grid-cols-1 gap-4 border-y border-gray-200 px-2 py-4 font-sans font-medium text-[var(--brand-500)] xl:grid-cols-2">
      {author && (
        <div className="w-full">
          <Link
            className="w-fit duration-200 hover:text-[var(--brand-700)]"
            href={`${prefixes.ETHER_PREFIX}${author}`}
            target="_blank"
          >
            <FaEthereum />

            {`${author.slice(0, 8)}...${author.slice(-8)}`}
          </Link>
        </div>
      )}

      {twitterHandle && (
        <div className="w-full">
          <Link
            className="w-fit duration-200 hover:text-[var(--brand-700)]"
            href={`${prefixes.TWITTER_PREFIX}${twitterHandle}`}
            target="_blank"
          >
            <FaXTwitter />

            {twitterHandle}
          </Link>
        </div>
      )}

      {website && (
        <div className="w-full">
          <Link className="w-fit duration-200 hover:text-[var(--brand-700)]" href={website} target="_blank">
            <RiGlobalLine />

            {website}
          </Link>
        </div>
      )}

      {githubHandle && (
        <div className="w-full">
          <Link
            className="w-fit duration-200 hover:text-[var(--brand-700)]"
            href={`${prefixes.GITHUB_PREFIX}${githubHandle}`}
            target="_blank"
          >
            <FaGithub />

            {githubHandle}
          </Link>
        </div>
      )}
    </div>
  );
};
