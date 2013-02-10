import re, os

input_path = '../src/'
no_demo = [
    'matrixWarp',
    'curves',
    'blend',
    'timeStrips',
    'stamp',
]

def sources():
    return [os.path.join(base, f) for base, folders, files in \
        os.walk(input_path) for f in files if f.endswith('.js')]

class ParseResult:
    def __init__(self, func):
        self.func = func
        self.docs = []

# returns a list where each item is a parsed documentation comment /** ... */
# each comment is a list of key, value tuples representing @ tags
def parse(text):
    results = []
    for match in re.findall(r'/\*\*(.*?)\*/\n([^\n]*)', text, re.DOTALL):
        docs, func = match
        match = re.match(r' *function +(\w+)', func)
        if not match:
            continue
        result = ParseResult(match.group(1))
        results.append(result)
        lines = [x.strip() for x in docs.split('\n')]
        lines = [x[1:].strip() if x.startswith('*') else x for x in lines]
        i = 0
        while i < len(lines):
            line = lines[i]
            i += 1
            if line.startswith('@'):
                key, value = line[1:].split(None, 1) if ' ' in line else (line[1:], '')
                while i < len(lines) and not lines[i].startswith('@'):
                    value += ' ' + lines[i]
                    i += 1
                result.docs.append((key, value.strip()))
    return results

def escape(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('\'', '&apos;')

def gen_doc(func, filter, description, params):
    html = '<div class="doc" id="%s">' % escape(func)
    html += '<h4>%s%s</h4>' % (escape(filter), ' <small>[<a href="/glfx.js/demo/#%s">demo</a>]</small>' % escape(func) if func not in no_demo else '')
    html += '<p><code>canvas.%s(%s);</code></p>' % (escape(func), ', '.join(escape(name) for (name, text) in params))
    html += '<p>' + escape(description) + '</p>'
    html += '<table class="docs">'
    for name, text in params:
        html += '<tr><td><code>%s</code></td><td>%s</td></tr>' % (escape(name), escape(text))
    html += '</table>'
    return html + '</div>'

def gen_docs():
    html = ''
    for path in sources():
        for result in parse(open(path).read()):
            filter = None
            description = None
            params = []
            for key, value in result.docs:
                if key == 'filter':
                    filter = value
                elif key == 'description':
                    description = value
                elif key == 'param':
                    params.append(tuple(value.split(None, 1)) if ' ' in value else (value, ''))
            if filter and description:
                html += gen_doc(result.func, filter, description, params)
    return html
