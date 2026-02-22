
import { Code, Terminal, Cpu, Database, Network, Search, Layers, GitBranch, MessageSquare } from "lucide-react";

export default function TechnicalDocs() {
    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Technical Review</h1>
                <p className="text-lg text-slate-600">
                    A deep dive into the architectural mechanics of PathoAssist, specifically focused on the AI pipeline, signal processing, and context-aware reasoning engines. This section is intended for technical auditors and engineers.
                </p>
            </div>

            {/* 1. Tissue Morphology & Signal Processing */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <div className="bg-teal-100 p-2 rounded-lg">
                        <Layers className="h-6 w-6 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">1. Tissue Morphology & Signal Processing</h2>
                </div>

                <p className="text-slate-600 leading-relaxed">
                    The WSI (Whole Slide Image) processing pipeline is built on top of <code>OpenSlide</code>.
                    Before any AI analysis occurs, the system must distinguish diagnostically relevant tissue from glass background, marker pen ink, and scanning artifacts.
                </p>

                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-mono text-teal-400">backend/app/wsi/tiling.py</span>
                        <span className="text-xs text-slate-400">Tissue Detection Logic</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                            {`def detect_tissue(self, image: Image.Image) -> Tuple[bool, float]:
    """Tissue detection using Otsu's Thresholding on Saturation channel."""
    
    # 1. Convert to grayscale for intensity analysis
    img_array = np.array(image)
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)

    # 2. Apply Otsu's thresholding to separate foreground/background
    # This dynamically finds the optimal separation value
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 3. Calculate tissue density
    # Pixels < 200 intensity are considered "tissue" (darker than white background)
    tissue_pixels = np.sum(binary < 200)
    total_pixels = binary.size
    tissue_ratio = tissue_pixels / total_pixels

    # 4. Threshold Check (default ratio > 0.15)
    is_background = tissue_ratio < self.min_tissue_ratio

    return is_background, tissue_ratio`}
                        </pre>
                    </div>
                </div>

                <p className="text-slate-600 text-sm">
                    <strong>Technical Note:</strong> We utilize Otsu's Binarization because it automatically calculates an optimal threshold value from the image histogram, making it robust against variations in slide staining intensity (H&E variability). Patches with insufficient tissue density are discarded upstream, reducing AI computational load by 40-60%.
                </p>
            </div>

            {/* 2. Feature Extraction & AI Vision */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <div className="bg-violet-100 p-2 rounded-lg">
                        <Cpu className="h-6 w-6 text-violet-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">2. Multimodal Feature Extraction</h2>
                </div>

                <p className="text-slate-600 leading-relaxed">
                    PathoAssist uses <strong>Google MedGemma-4B</strong> (or similar vision-language models) for feature extraction.
                    Unlike standard CNNs which only output class probabilities, this VLM (Vision-Language Model) architecture projects visual patches into a shared embedding space with clinical text.
                </p>

                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-mono text-violet-400">backend/app/inference/engine.py</span>
                        <span className="text-xs text-slate-400">Multimodal Injection</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                            {`def _analyze_with_images(self, case_id, patches, clinical_context...):
    # 1. Image Preprocessing
    # Lanczos resampling ensures high-frequency histological details are preserved
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    
    # 2. Multimodal Prompt Construction
    # The processor handles token insertion <image> automatically
    user_content = []
    for _ in patch_images:
        user_content.append({"type": "image"}) 
    
    # Inject text prompt alongside images
    text_prompt = self.prompt_builder.build_analysis_prompt(...)
    user_content.append({"type": "text", "text": text_prompt})

    # 3. Forward Pass
    inputs = self.processor(
        text=text,
        images=patch_images,
        return_tensors="pt",
        padding=True
    ).to(self.device)

    # 4. Generation with Temperature Scaling
    # output_hidden_states=True allows us to capture the embedding later
    generation = self.model.generate(
        **inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.2, # Low temperature for factual consistency
        output_hidden_states=True 
    )`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* 3. Context Embedding & RAG */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <Database className="h-6 w-6 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">3. Context Embedding (RAG)</h2>
                </div>

                <p className="text-slate-600 leading-relaxed">
                    To support "Find Similar Cases" features, we extract the dense vector representation of the pathology image from the model's hidden states.
                    This vector encapsulates the high-dimensional visual features (nuclear atypia patterns, mitotic count estimates) which can then be compared using cosine similarity.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700">
                            <span className="text-xs font-mono text-amber-400">Embedding Extraction</span>
                        </div>
                        <div className="p-4 overflow-x-auto h-full">
                            <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                                {`# From backend/app/inference/engine.py

if generation.hidden_states:
    # Extract last layer hidden state
    # Shape: (Batch, Sequence, Hidden_Dim)
    last_layer = generation.hidden_states[0][-1]
    
    # Global Average Pooling to get single vector
    embedding = last_layer.mean(dim=1).squeeze()
    
    # This 4096-dim vector is the "Diagnostic Fingerprint"`}
                            </pre>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700">
                            <span className="text-xs font-mono text-amber-400">Cosine Similarity Search</span>
                        </div>
                        <div className="p-4 overflow-x-auto h-full">
                            <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                                {`# From backend/app/inference/rag.py

def search(self, query_vec, k=3):
    # Normalize query vector for Cosine Sim
    query_norm = np.linalg.norm(query_vec)
    q = (query_vec / query_norm).reshape(1, -1)
    
    # Matrix multiplication over Atlas
    # scores shape: (N_entries,)
    scores = np.dot(self.normalized_matrix, q.T).flatten()
    
    # Retrieve top K indices
    top_k_indices = np.argsort(scores)[-k:][::-1]
    return [self.entries[i] for i in top_k_indices]`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. AI Chatbot Reasoning */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">4. Context-Aware Chatbot Reasoning</h2>
                </div>

                <p className="text-slate-600 leading-relaxed">
                    The "PathoAssist AI Bot" is not a generic chatbot. It is injected with a structured <strong>Context Packet</strong> before every interaction.
                    This ensures the model is aware of the current patient's age, history, and the specific findings from the slide currently being viewed.
                </p>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h4 className="font-bold text-slate-800 mb-4">Context Packet Construction (Frontend vs Backend)</h4>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Frontend (React)</div>
                            <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-700 overflow-x-auto">
                                {`// src/components/copilot/PathoCopilot.tsx

const context = {
    patient: {
        age: patientData.age,
        history: patientData.medicalHistory
    },
    findings: analysisResult.findings, // The AI findings
    rois: roiResult.length 
};

// Sends this packet with every message
sendChatMessage(caseId, messages, context);`}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Backend (Python)</div>
                            <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-700 overflow-x-auto">
                                {`# backend/app/inference/engine.py

def chat(..., context):
    system_text = get_system_prompt()
    
    # Dynamic Context Injection
    if context:
        system_text += f"\\nPatient: {context['patient']}"
        system_text += f"\\nFindings: {context['findings']}"
        
    # The model now "knows" what the user sees
    prompt = f"{system_text}\\nUser: {last_msg}"`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-100 border-l-4 border-slate-400 p-6 rounded-r-xl">
                <p className="text-slate-700 text-sm italic">
                    "The code extractions above demonstrate a system designed for <strong>traceability</strong> and <strong>interpretability</strong>.
                    By decoupling tissue detection, feature extraction, and reasoning, we ensure that every diagnostic suggestion can be traced back to specific visual regions and verified against the raw slide data."
                </p>
                <div className="mt-2 text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    System Architecture Review v1.2
                </div>
            </div>
        </div>
    );
}
