export function extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
        return titleMatch[1].trim();
    }
    return 'Untitled';
}

export function extractDate(content) {
    const dateMatch = content.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
}

export function extractSnippet(content) {
    const lines = content.split('\n');
    let snippetLines = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('Date:') && !trimmed.startsWith('-')) {
            snippetLines.push(trimmed);
            if (snippetLines.length >= 3) break; // Get up to 3 lines
        }
    }
    
    if (snippetLines.length === 0) {
        // Fallback to first bullet point
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('-')) {
                return trimmed.substring(1).trim();
            }
        }
        return 'No description available';
    }
    
    const snippet = snippetLines.join(' ');
    return snippet.length > 200 ? snippet.substring(0, 200) + '...' : snippet;
}

export function convertMarkdownToHtml(markdown) {
    let html = markdown;
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/^(?!<[h|u|o])(.+)$/gim, '<p>$1</p>');
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
}

export async function loadMarkdownFiles(markdownFiles) {
    try {
        const researchFiles = [];
        
        for (const filename of markdownFiles) {
            try {
                const response = await fetch(`md/${filename}`);
                if (response.ok) {
                    const content = await response.text();
                    const title = extractTitle(content);
                    const snippet = extractSnippet(content);
                    const date = extractDate(content);
                    
                    researchFiles.push({
                        id: filename.replace('.md', ''),
                        title: title,
                        filename: filename,
                        snippet: snippet,
                        content: content,
                        date: date
                    });
                }
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error);
            }
        }
        
        return researchFiles;
    } catch (error) {
        console.error('Error loading markdown files:', error);
        return [];
    }
}
