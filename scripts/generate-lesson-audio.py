"""Regenerate bundled audio on macOS. CI uses the committed recordings."""
from pathlib import Path
import re, json, hashlib, subprocess, tempfile
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parent.parent
texts=[]
for en,zh,icon,category,sentence in re.findall(r"\['([^']*)','([^']*)','([^']*)','([^']*)','([^']*)'\]", (root/'app/words.ts').read_text()): texts.extend([en,sentence])
for en,zh,icon,sentence in re.findall(r"\['([^']*)','([^']*)','([^']*)','([^']*)'\]", (root/'github-pages/lessons.ts').read_text()): texts.extend([en,sentence])
texts.extend(re.findall(r"text:'([^']*)'", (root/'app/passages.ts').read_text()))
source=(root/'lib/story-illustrations.ts').read_text()
texts.extend(p['text'] for p in json.loads(re.search(r'export const illustrations = (\[.*?\]);',source,re.S).group(1)))
def key(text):return re.sub(r'\s+',' ',text.strip().lower()).replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
unique={key(text):text for text in texts}
out=root/'public/lesson-audio';out.mkdir(exist_ok=True)
manifest={k:hashlib.sha256(k.encode()).hexdigest()[:16]+'.m4a' for k in unique}
def generate(item):
 k,text=item;file=out/manifest[k]
 if file.exists() and file.stat().st_size>1000:return
 with tempfile.TemporaryDirectory() as temp:
  aiff=Path(temp)/'clip.aiff'
  subprocess.run(['/usr/bin/say','-v','Samantha','-r','145','-o',str(aiff),text],check=True)
  subprocess.run(['/usr/bin/afconvert','-f','m4af','-d','aac','-b','64000',str(aiff),str(file)],check=True)
 if file.stat().st_size<1000:raise RuntimeError('Audio generation failed: '+text)
with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(generate,unique.items()))
(root/'lib/lesson-audio.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(manifest)} word, sentence and paragraph recordings')
