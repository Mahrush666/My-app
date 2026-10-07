import { publicAsset } from './public-runtime';
// Illustrations follow the paragraph content, so reordered readings keep the correct picture.
export const illustrations = [
  {
    "text": "In Africa there is a big coconut tree. It is next to the sea and a town. Every day a monkey goes and eats its delicious coconuts. Every day he gives some to a shark.",
    "src": "/story-illustrations/monkey-shark-1.webp",
    "alt": "The monkey shares a coconut with the shark beside a coconut palm."
  },
  {
    "text": "One day, the shark says, “You are very nice to me. I would like to invite you to my house.”",
    "src": "/story-illustrations/monkey-shark-2.webp",
    "alt": "The shark invites the monkey to visit his home."
  },
  {
    "text": "“But I don’t go in the sea,” says the monkey. “No problem,” says the shark. “Jump on my back!” The shark swims away with the monkey.",
    "src": "/story-illustrations/monkey-shark-3.webp",
    "alt": "The monkey rides on the shark’s back across the sea."
  },
  {
    "text": "“At home our king is very ill,” the shark says. “He needs a monkey’s heart to make him well.” The monkey thinks for a moment.",
    "src": "/story-illustrations/monkey-shark-4.webp",
    "alt": "The shark describes his ill king while the monkey thinks."
  },
  {
    "text": "“Oh, no!” he says. “I haven’t got my heart with me. When I go out I put my heart in the tree.”",
    "src": "/story-illustrations/monkey-shark-5.webp",
    "alt": "The monkey points toward the tree, claiming that his heart is there."
  },
  {
    "text": "“No problem,” says the shark. “Let’s go back and get it!” They go back to the tree and the monkey jumps off the shark’s back. “Wait here,” says the monkey.",
    "src": "/story-illustrations/monkey-shark-6.webp",
    "alt": "The monkey jumps off the shark and reaches the coconut tree."
  },
  {
    "text": "The shark waits and waits ... and waits ... and waits. “What are you doing?” the shark shouts. “Let’s go!”",
    "src": "/story-illustrations/monkey-shark-7.webp",
    "alt": "The shark waits below the tree while the monkey stays safely above."
  },
  {
    "text": "“No way!” the monkey shouts back. “You’re not tricking me again! I need my heart!” and he runs away laughing.",
    "src": "/story-illustrations/monkey-shark-8.webp",
    "alt": "The monkey runs away laughing while the shark stays in the water."
  }
];
export function storyIllustration(text:string){const item=illustrations.find(item=>item.text===text);return item?{...item,src:publicAsset(item.src)}:undefined}
