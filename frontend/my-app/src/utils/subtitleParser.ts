import JSZip from 'jszip';

export interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export async function parseSubtitlesFromZip(zipFile: File): Promise<Subtitle[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);
  
  // Try to find subtitle files in order of preference
  const fileExtensions = ['.vtt', '.srt', '.json'];
  let subtitleContent = null;
  
  for (const ext of fileExtensions) {
    const file = Object.values(contents.files).find(f => f.name.endsWith(ext));
    if (file) {
      subtitleContent = await file.async('string');
      if (ext === '.json') {
        return JSON.parse(subtitleContent);
      } else if (ext === '.vtt') {
        return parseVTT(subtitleContent);
      } else if (ext === '.srt') {
        return parseSRT(subtitleContent);
      }
    }
  }
  
  throw new Error('No supported subtitle file found in zip');
}

function parseVTT(content: string): Subtitle[] {
  const lines = content.trim().split('\n');
  const subtitles: Subtitle[] = [];
  let currentSubtitle: Partial<Subtitle> = {};
  let id = 1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map(timeStr => {
        const [mins, secs] = timeStr.trim().split(':');
        return parseInt(mins) * 60 + parseFloat(secs);
      });
      
      currentSubtitle = {
        id: id++,
        startTime: start,
        endTime: end,
        text: ''
      };
    } else if (line && currentSubtitle.startTime !== undefined) {
      currentSubtitle.text = (currentSubtitle.text || '') + ' ' + line;
    } else if (!line && currentSubtitle.text) {
      subtitles.push(currentSubtitle as Subtitle);
      currentSubtitle = {};
    }
  }
  
  if (currentSubtitle.text) {
    subtitles.push(currentSubtitle as Subtitle);
  }
  
  return subtitles;
}

function parseSRT(content: string): Subtitle[] {
  const blocks = content.trim().split('\n\n');
  return blocks.map((block, index) => {
    const lines = block.split('\n');
    const times = lines[1].split('-->').map(timeStr => {
      const [h, m, s] = timeStr.trim().split(':');
      const [secs, ms] = s.split(',');
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(secs) + parseInt(ms) / 1000;
    });
    
    return {
      id: index + 1,
      startTime: times[0],
      endTime: times[1],
      text: lines.slice(2).join(' ').trim()
    };
  });
}