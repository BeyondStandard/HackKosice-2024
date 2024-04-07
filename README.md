_In a digital world where yesterday's code quickly becomes obsolete, our new platform offers a lifeline. We rejuvenate outdated codebases, transforming them into sleek, maintainable masterpieces. Join us in giving forgotten code a second life, paving the way for tomorrow's innovations._

At Hack Kosice 2024, drawing inspiration from Deutsche Telekom—one of the event's sponsors—my team and I ventured into the complex realm of legacy code maintenance. We recognized that while individual developers might find their own code challenging to maintain after just a year, the giants of the IT world are wrestling with codebases that are several decades old, created by professionals who have long since retired.

Fuelled by this realization, we swiftly aligned on our project's objectives and were able to implement our key features with remarkable speed:

![Foundation](https://imgur.com/VETZRdm.png)

While we were pleased with these accomplishments, the real triumph was how we built upon this solid foundation to achieve something truly groundbreaking:


![Code Generation](https://imgur.com/qz3TGpe.gif)


### How we built it

Our project unfolds through four distinct but interconnected modules, each serving a critical function in our vision of code revitalization. The journey begins with the process of tokenization and vectorization, an operation where entire code repositories are deconstructed layer by layer. This dissection progresses from files to functions, from functions to individual lines, and finally, from lines to discrete tokens. These tokens are then vectorized, capturing the essence of the code in a form amenable to advanced analysis. This transformed data is then cataloged in a specialized ChromaDB database, ensuring that each fragment, each vectorized token, is readily accessible for retrieval, should the need arise during the transformation process. This database becomes the bedrock upon which our system's intelligence is built, later integrated and dispatched to OpenAI's environment, where our primary agent lies in wait, primed for the tasks ahead.

The second module acts as the strategic commander of operations, orchestrating the flow of information and directives. Hosted on Heroku, this backend system is the conduit through which the magic happens, dispatching commands that guide the transformation and elucidation processes conducted by an array of language models. This backend serves not just as a bridge but as a mediator, ensuring that the outputs—be they translations, enhancements, or clarifications—are seamlessly relayed to the user interface for further refinement, or approval.

Our third module is the gateway to the user experience, a responsive frontend that resides at the memorable URL https://TelevateYourCodeWith.Us/. This platform embodies our commitment to accessibility, offering users a web-based interface to interact with our system's capabilities. While ambitions to extend our reach into the realm of integrated development environments, specifically through a Visual Studio Code plugin, had to be curtailed due to time constraints, the website stands as a testament to our dedication to making advanced code transformation technologies accessible to all.

Finally, we arrive at the cornerstone of our architecture—the hierarchy of language model agents. This module is the intellectual core of our application, where the AI-driven agents collaborates to produce the most refined, efficient, and understandable code transformations. Grounded in best practices and supported by comprehensive testing, this system doesn't just rewrite code; it imbues it with clarity, ensuring that each decision, each alteration, is accompanied by a rationale that educates.


### Challenges we ran into

Navigating the complexities of this project was far from straightforward though; it was a journey marked by numerous challenges that tested our ingenuity at every turn. Among these hurdles, sleep deprivation and an initial unfamiliarity with technologies such as Auth0 were significant, yet perhaps expected, obstacles. However, what caught us off guard was not the anticipated difficulties inherent to our ambitious endeavor but rather the persistent and perplexing bugs. Confronted with unexpected issues, our natural inclination was to introspect and to scour our own code for mistakes, assuming the fault lay within our work. The realization that the root of our troubles sometimes lay in third-party libraries came with a mix of relief and frustration. Unearthing bugs in external code, especially within tools and libraries trusted and utilized by developers globally, presented a unique challenge. It required us to extend our expertise beyond our project, delving into the intricacies of external codebases and the community-driven ecosystems that sustain them.

![Open Issues](https://imgur.com/PKHAQYj.png)


                           _One of the open bugs that got us in the LangChain library, visualized with [issue visualizer](https://github-issue-vizualiser.netlify.app/)_


### Accomplishments that we're proud of

The aspect of our project that fills us with the most pride is undoubtedly the depth and breadth of our Minimum Viable Product. To conceive and execute a functional, online-hosted platform within the confines of mere 24 hours is an achievement in itself. But we didn't stop there; our ambition pushed us further, enabling us to infuse our MVP with aesthetic enhancements that transcended the basic functional requirements.


### What's next for Televate

The segment of our project that still stands as the prime candidate for enhancement is the intricate web of agent interactions, which truly forms the heart and soul of our platform. Given the inherent time limitations associated with a hackathon setting, fully integrating sophisticated frameworks like CrewAI or Pythagora into our system was a formidable challenge that we could not surmount within the available timeframe. We recognize the critical importance of this component in ensuring the generation of high-quality code, an element just as vital as the comprehension capabilities we successfully implemented.

Should these enhancements elevate our project to meet, or even exceed, our expectations, we stand on the cusp of a transformative journey. The path could lead us toward establishing an open-source platform that empowers the broader developer community, or perhaps even laying the groundwork for a startup. The demand for a solution that rejuvenates legacy systems is palpable among older corporations, and our platform is poised to fulfill this pressing need, heralding a new era in code management and revitalization.
