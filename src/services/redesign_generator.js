const { HfInference } = require('@huggingface/inference');
const fs = require('fs-extra');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function generateRedesignPreview(fixedComponentCode, componentName) {
  const prompt = `Modern Tailwind CSS ${componentName} UI mockup, clean design, professional, high quality, white background`;

  try {
    const result = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: prompt,
      parameters: {
        width: 400,
        height: 300,
        num_inference_steps: 20
      }
    });

    // Save image
    const filename = `redesign-${Date.now()}.png`;
    const filepath = path.join(__dirname, '..', '..', 'public', 'redesigns', filename);
    
    await fs.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, result);

    return `/redesigns/${filename}`;
  } catch (error) {
    // Fallback image
    return '/static/fallback-redesign.png';
  }
}

module.exports = { generateRedesignPreview };
