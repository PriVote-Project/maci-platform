import { FaXTwitter } from "react-icons/fa6";

import { Button } from "~/components/ui/Button";

export interface IAppealButtonProps {
  projectName: string;
}

export const AppealButton = ({ projectName }: IAppealButtonProps): JSX.Element => {
  const handleAppeal = () => {
    const tweetText = `Voting for the @gitcoin GG24 Privacy Round is LIVE on @privoteweb3!\nHelp us move privacy forward. A vote for ${projectName} is a vote for a more secure, user-centric Internet.\nAny human with a @HumnPassport can vote. Your support is crucial.\nVote here: gitcoin.privote.live`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button className="flex items-center gap-2" size="auto" variant="primary" onClick={handleAppeal}>
      <FaXTwitter size={16} />
      Appeal for Votes
    </Button>
  );
};
