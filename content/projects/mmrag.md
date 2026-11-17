---
id: mmrag
name: Multimodal RAG over slides and reports
where: CMU, 10-423/623 Generative AI
with: John Speaks, Darren Chen
period: Spring 2026 (report April 2026)
methods: [Retrieval-augmented generation, Vision-language models, Parameter-efficient fine-tuning]
tools: [PyTorch, Qwen3-VL, ColQwen, Qdrant, AWS]
source: https://github.com/JTSIV1/multimodal-rag; report https://johnspeaks.com/gen_ai_final.pdf (copied to content/assets/mmrag/report.pdf); John's page https://johnspeaks.com/multimodal_rag.html
links: [Report (PDF) -> content/assets/mmrag/report.pdf, GitHub -> https://github.com/JTSIV1/multimodal-rag]
role: Nicolas owned REAL-MM-RAG data preparation, the ColQwen retriever integration and indexing, the ideal-context inference notebooks for base and fine-tuned models, and the lecture-slide curation and QA generation pipeline (shared with Darren). John owned fine-tuning and evaluation; Darren the QA generation pipeline (report, Table 3).
disclosure: public. Credit as a team project with John Speaks and Darren Chen.
---
Retrieve document pages as images, not OCR text, and a vision-language model answers questions about slides and reports more accurately.

## Facts
- 11 setups on REAL-MM-RAG (8,000+ pages, 5,000 queries) with Qwen3-VL-8B, from no context to fine-tuned image RAG.
- Image retrieval beat OCR-text retrieval on every metric: ROUGE-L 0.676 against 0.472, LLM-judged accuracy 4.53 against 2.96 out of 5.
- QLoRA fine-tuning raised the n-gram scores (ROUGE-L 0.676 to 0.701) but not the LLM-judged ones.
- About $200 of compute: AWS A10G, Colab A100 and Gemma-4 judging.

## Sections

### Approach
Lecture slides and technical reports keep much of their meaning in tables, figures and layout, and OCR flattens it. The pipeline indexes whole pages with a late-interaction visual retriever (ColQwen3.5, per-patch embeddings in Qdrant) and hands the retrieved page images to Qwen3-VL, against a baseline that OCRs pages, embeds text chunks and retrieves from ChromaDB.

### Evaluation
Each setup was scored with BLEU, ROUGE, BERTScore and four LLM-as-judge rubrics (accuracy, relevance, groundedness, faithfulness). Ideal-context runs, which hand the model the right page, bound what retrieval can reach. A hand-curated set of about 650 course slides, with questions written by a larger Qwen3-VL, tested whether fine-tuning on reports transfers to lecture material.

## Visual
Lead: the eleven setups as a ladder on one metric axis (ROUGE-L, with LLM-judged accuracy as a second row), mean and 95% interval from the report's Table 1, so the order no context < OCR RAG < image RAG < ideal image reads at a glance. Drawn by the site, not copied from the PDF.
Supporting: the pipeline as a small diagram (page images, ColQwen index, Qwen3-VL, LoRA adapters), drawn by the site.
Table 1 means (BLEU, R-1, R-2, R-L, BERTScore, LLM accuracy, relevance, groundedness, faithfulness):
- A no context: 0.2150, 0.4754, 0.3075, 0.4138, 0.9121, 1.9658, 4.8240, 1.0228, 1.0228
- B ideal OCR: 0.3706, 0.6673, 0.5176, 0.6021, 0.9400, 4.3211, 4.9585, 4.5902, 4.6595
- C ideal image: 0.4845, 0.7704, 0.6461, 0.7143, 0.9577, 4.5994, 4.9725, 4.8399, 4.8129
- D RAG OCR: 0.2615, 0.5256, 0.3808, 0.4718, 0.9160, 2.9575, 4.7663, 4.3871, 4.5192
- E RAG image: 0.4374, 0.7348, 0.6023, 0.6756, 0.9519, 4.5324, 4.9892, 4.8239, 4.8636
- F ideal fine-tuned: 0.5245, 0.7846, 0.6696, 0.7407, 0.9617, 4.4978, 4.9624, 4.8100, 4.8361
- G RAG fine-tuned: 0.4736, 0.7485, 0.6241, 0.7007, 0.9559, 4.4323, 4.9791, 4.7941, 4.8871
- H slides, ideal, base: 0.3303, 0.7012, 0.5096, 0.6183, 0.9354, 4.8107, 4.9826, 4.8503, 4.8764
- I slides, ideal, fine-tuned: 0.3622, 0.7065, 0.5463, 0.6441, 0.9403, 4.5537, 4.9185, 4.8515, 4.8735
- J slides, RAG, base: 0.2982, 0.6688, 0.4751, 0.5848, 0.9297, 4.7406, 4.9993, 4.8343, 4.9278
- K slides, RAG, fine-tuned: 0.3228, 0.6811, 0.4924, 0.6064, 0.9336, 4.6359, 4.9891, 4.8044, 4.9516
95% intervals are in the report's Table 1.
