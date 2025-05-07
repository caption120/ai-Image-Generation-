// DOM Element References
const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-from");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("Model-select");
const ratioSelect = document.querySelector("#Ratio-select");
const countSelect = document.querySelector("#Count-select");
const gridGallery = document.querySelector(".gallery-grid");

// Hugging Face API Key
const apiKey = "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"; // Replace with your actual API key

// Example Prompts
const examplePrompts = [
  "A young girl with flowing hair in a red dress standing in a lush green meadow with floating lanterns, in Studio Ghibli animation style.",
  "A vibrant YouTube thumbnail featuring a person holding the latest smartphone with a surprised expression, bold text saying 'Unboxing the Future!', and a futuristic background.",
  "A single-page comic strip showing a cat's adventure through a city at night, with three panels: sneaking past humans, discovering a secret alley, and finding a hidden treasure.",
  "A chibi-style pixel art character of a warrior with spiky blue hair, holding a glowing sword, ready for battle, on a transparent background.",
  "An elegant wedding invitation card with floral borders, gold accents, and cursive text reading 'Join us for the wedding of Aisha & Rahul, December 15, 2025'.",
  "A meme image of a dog sitting at a desk with a cup of coffee, looking stressed, captioned 'When you realize it's Monday again'.",
  "A modern label for a skincare product named 'Glow Essence', featuring minimalist design, pastel colors, and botanical illustrations.",
  "A sleek landing page design for a fitness app, showcasing a hero image of a person jogging, call-to-action buttons, and sections for features and testimonials.",
  "An infographic explaining the water cycle, including stages: evaporation, condensation, precipitation, and collection, with simple icons and arrows.",
  "A fantasy landscape featuring floating islands connected by bridges, waterfalls cascading into the sky, and a sunset background with vibrant colors.",
];

// Theme Initialization
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// Calculate Image Dimensions Based on Aspect Ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [widthRatio, heightRatio] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(widthRatio * heightRatio);

  let calculatedWidth = Math.round(widthRatio * scaleFactor);
  let calculatedHeight = Math.round(heightRatio * scaleFactor);

  // Ensure dimensions are multiples of 16
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

// Generate Images Using Hugging Face Inference API
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const modelUrl = `https://api-inference.huggingface.co/models/${selectedModel}`;
  const { width, height } = getImageDimensions(aspectRatio);

  for (let i = 0; i < imageCount; i++) {
    try {
      const response = await fetch(modelUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      const imgCard = document.getElementById(`img-card${i}`);
      const imgElement = imgCard.querySelector("img");
      imgElement.src = imageUrl;
      imgCard.classList.remove("loading");

      // Add download button
      const downloadButton = document.createElement("a");
      downloadButton.href = imageUrl;
      downloadButton.download = `generated_image_${i + 1}.png`;
      downloadButton.textContent = "Download";
      downloadButton.classList.add("download-btn");
      imgCard.appendChild(downloadButton);
    } catch (error) {
      console.error("Error generating image:", error);
      const imgCard = document.getElementById(`img-card${i}`);
      imgCard.classList.remove("loading");
      imgCard.innerHTML = `<p class="error-message">Failed to generate image.</p>`;
    }
  }
};

// Create Placeholder Cards with Loading Spinner
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" id="img-card${i}" style="aspect-ratio: ${aspectRatio}">
        <img src="loading-spinner.gif" alt="Loading image ${i}" class="result-img">
        <div class="img-overlay"></div>
      </div>`;
  }

  generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Handle Form Submission
const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  if (!selectedModel) {
    alert("Please select a model.");
    return;
  }

  if (!promptText) {
    alert("Please enter a prompt.");
    return;
  }

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

// Fill Random Prompt
promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

// Event Listeners
promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
