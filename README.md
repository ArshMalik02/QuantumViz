# QuantumViz

![image](https://github.com/user-attachments/assets/0cb156fa-b698-40c4-bbed-548573436bf6)


QuantumViz is a quantum circuit generator that simplifies and enhances the process of designing quantum computing by text or speech using AI to generate interactive 3D visualization, executable code snippets, and a customized chatbot trained on Quantum Code Documentation and Research Papers. It addresses key pain points identified by leading experts in the field, offering a more visual and intuitive interface for users to create complex quantum circuits without the need for extensive coding knowledge at all. Frontend built on Nextjs using SaaS boilerplate, Shadcn and Tailwind components.

## Key Features:
- Natural Language Interface: The product allows users to generate circuit designs using natural language, making it more accessible and intuitive for those unfamiliar with traditional coding methods.
- Multimodal Visualizations of Circuit and Qubits: Users can visualize circuits in all different combinations before writing any code, facilitating a better understanding of circuit design and flow.
- Generation and Export Features for LaTeX and Python Code: Users can easily generate and export circuit diagrams in LaTeX format, streamlining the documentation process for research papers and presentations.
- Customized Chatbot: Conversational agent trained on the 100s of research papers and Circuit Documentation for code
- Research Paper Parsing: QuantumViz also has the ability to automatically extract images of quantum circuits directly from arXiv and surf the web powered by plans crafted by our custom LLM and directly convert them into Qiskit code through our website. We use a combination of Selenium and Scrapy to navigate through links and figures within research papers to allow researchers to automatically screenshot and input those images onto the platform.

![image](https://github.com/user-attachments/assets/77068391-04c9-4ee0-bbeb-096c2f672664)

## Endorsements

- [Dr. Jens Palsberg](https://web.cs.ucla.edu/~palsberg/) (Quantum Computing Researcher, UCLA CS Faculty): “A more visual and intuitive method for designing quantum circuits would be a game-changer, especially if it allows us to visualize circuits in a multimodal way before even writing a line of code. This approach addresses a critical gap in the current tools, streamlining the design process significantly.”
- [Dr. Alan Ho](https://www.linkedin.com/in/karlunho/) (Google Quantum AI, Quantum Qolab Founder): “The ability to create quantum circuits through natural language is a breakthrough that could revolutionize how we interact with these complex systems. Leveraging multimodal LLM interfaces for circuit visualization and interaction could make quantum computing far more accessible, intuitive, and efficient.”
- [Sam McArdle](https://www.linkedin.com/in/sam-mcardle-26488081/) (Leading Quantum Scientist at AWS): “One of the biggest challenges in quantum computing research is the cumbersome process of manually coding LaTeX for circuit representations. A tool that generates circuit diagrams and exports them directly to LaTeX would not only save time but also enhance the accuracy and efficiency of research documentation.”

## Future goals include:

- Enhanced Model Training: We will train our models using images of quantum circuits, not just text, to improve visual understanding and design accuracy. This multimodal approach will help users visualize their ideas more intuitively.
- Testing for Complex Designs: We will conduct rigorous testing to ensure our tool's accuracy with intricate circuit designs. Collaborating with researchers will help refine our algorithms, enhancing performance and reliability.
- Integration with Existing Tools: We aim to integrate QuantumViz with established platforms like IBM’s quantum tools to address knowledge gaps. This integration will streamline the user experience, empowering users with a comprehensive set of features for effective circuit design


*Developed with Arsh Malik, Aashman Rastogi, Howard Huang, and Claire Li for [Cerebral Hacks 2024](https://hack.cerebralbeach.com/). Checkout our devpost [here](https://devpost.com/software/quantumviz)*
