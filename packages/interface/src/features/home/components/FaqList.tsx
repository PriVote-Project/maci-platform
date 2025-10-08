import { Heading } from "~/components/ui/Heading";

import { FAQItem } from "./FaqItem";

export const FAQList = (): JSX.Element => (
  <div className=" flex flex-col items-center justify-center py-14 sm:pt-28 dark:text-white" id="FAQ">
    <Heading size="6xl">FAQ</Heading>

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://grants.gitcoin.co/"
              rel="noreferrer"
              target="_blank"
            >
              Gitcoin Governance Round number 24
            </a>{" "}
            is an opportunity for the community to contribute to different projects and initiatives in the ecosystem.
            The rounds are categorized into different topics (e.g. Privacy) and projects can apply to specific rounds
            depending on the eligibility.
          </p>

          <p>
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://gov.gitcoin.co/t/the-case-for-privacy-gg24-maci-allo-capital/22491/10"
              rel="noreferrer"
              target="_blank"
            >
              The GG24 Privacy domain
            </a>{" "}
            will cover projects related to privacy in terms of research, dApps, infrastructure and education. All
            projects, initiatives and individuals working on privacy related topics are welcome to apply.
          </p>
        </div>
      }
      title="What is GG24 and the privacy domain?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://gov.gitcoin.co/t/gg24-domains-and-allocations/24382"
              rel="noreferrer"
              target="_blank"
            >
              There are 6 separate domains for GG24
            </a>
            , the privacy domain is just one of them. If your project integrates privacy, you are in the right place.
            Projects that do not meet the criteria for the privacy domain can explore applying to other domains for
            funding. The privacy domain is the only domain that will be using MACI as a voting protocol.
          </p>

          <p>
            One project can apply to multiple rounds within GG24. The project needs to fill up the submission form in
            each specific round.
          </p>
        </div>
      }
      title="What is the difference between the GG24 privacy domain and other domains for GG24?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://maci.pse.dev/"
              rel="noreferrer"
              target="_blank"
            >
              Minimal Anti-Collusion Infrastructure (MACI)
            </a>{" "}
            is a private, on-chain, voting system.
          </p>

          <p>
            MACI is an open-source cryptographic protocol designed to facilitate secure, anonymous voting systems while
            minimizing the potential for collusion, manipulation and bribery using zero-knowledge proofs.
          </p>
        </div>
      }
      title="What is MACI?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            Privote brings a simple and intuitive user experience (UX) to the powerful privacy of the MACI protocol. We
            focus on removing Web3 complexity, allowing anyone to create or vote in secure, anonymous polls in just a
            few clicks. Our mission is to radically improve the UX of on-chain governance.
          </p>

          <p>
            Find out more at:&nbsp;
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://privote.live"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://privote.live
            </a>
          </p>
        </div>
      }
      title="What is Privote?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            Prepare all your project evidence (documents, website, research, slides, etc) and submit your application
            through the form in&nbsp;
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://gitcoin.privote.live"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://gitcoin.privote.live
            </a>
            &nbsp;after the application period starts on Oct 14th and before the deadline (Oct 21th)
          </p>
        </div>
      }
      title="How do I apply?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            This will vary depending on your project and the category you are applying for. We suggest you write a clear
            description of your project, explain how privacy is used, and link relevant documents (whitepaper, research
            paper, code repository, podcast website, etc).
          </p>

          <p>
            As round operators, we are aware of the challenges of submitting research and innovative prototypes. We will
            dedicate time to read and navigate through your submitted documents.
          </p>
        </div>
      }
      title="What should I submit as evidence of my project?"
    />

    <FAQItem
      description="We encourage participants to prepare their applications diligently but we know that the time constraint might make it difficult to submit everything. In case we like your application and we need more information we will contact you through the contact method provided in the application"
      title="What happens if something is missing?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            There will be two selection processes in this round overall. The first one determines if a project qualifies
            for the Privacy round. This is completed by the MACI team as Gitcoin round operators. The main goal is to
            filter malicious or non-related applications.
          </p>

          <p>
            The second selection process is the voting process where voters vote for the projects. Anyone can donate
            matching funds during the round to be added to the matching pool. This process involves the community, and
            we encourage projects to invite community members to participate to grow their funding results, which depend
            on community donations and Gitcoin funds.
          </p>
        </div>
      }
      title="How does the selection process work for the Privacy round of GG24? Who determines what applicants will get funded?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            The round funds and community donations will be sent to this specific on-chain address. Arbitrum is a L2
            built on top of Ethereum with full EVM support. Therefore your Ethereum wallet would work in Arbitrum with
            no additional changes. We recommend projects with more than one stakeholder to use a multi-signature wallet
            address. YOU CAN&apos;T CHANGE YOUR SUBMITTED WALLET AFTER PROJECT SUBMISSION IN THE PORTAL.
          </p>

          <p>
            If you need more information about how wallets work, you can check out this guide:&nbsp;
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://ethereum.org/wallets/"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://ethereum.org/wallets/
            </a>
          </p>
        </div>
      }
      title="What is my Arbitrum payout address?"
    />

    <FAQItem
      description="The application form will ask projects to submit an Arbitrum address where the funds will be distributed after the results tallying. This address is not changeable after the application has been submitted."
      title="Where will the projects receive the funds?"
    />

    <FAQItem
      description="Donations and rewards will be in WETH. Projects with positive results and donations will be able to claim the funds after the tallying process. The website will have a claim button and participants will also be able to claim it directly in the smart contract."
      title="What currency will selected projects receive funds in? How soon will I be able to access them?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            Of course! After your application has been accepted you can invite friends, family and collaborators to
            participate in the round. The more people supporting your project, the larger the funds to be received after
            the voting.
          </p>

          <p>
            To learn more, you can read about Quadratic Funding here:&nbsp;
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://www.gitcoin.co/blog/gitcoin-grants-quadratic-funding-for-the-world"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://www.gitcoin.co/blog/gitcoin-grants-quadratic-funding-for-the-world
            </a>
          </p>
        </div>
      }
      title="Can I invite my community to support my project?"
    />

    <FAQItem
      description={
        <>
          Write to us at&nbsp;
          <a className="text-blue-600 underline dark:text-blue-400" href="mailto:web3privacynow@protonmail.com">
            web3privacynow@protonmail.com
          </a>
        </>
      }
      title="Where can I contact round operators?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            Check out our&nbsp;
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://pse-team.notion.site/gg24-privacy-round"
              rel="noopener noreferrer"
              target="_blank"
            >
              Notion page
            </a>
            &nbsp;for more detailed information about the round.
          </p>
        </div>
      }
      title="Do you have any other questions?"
    />
  </div>
);
