#!/usr/bin/python

module = 'fx'
input_path = 'src/'
output_path = 'glfx.js'

import re, os, sys, time, tempfile

header = '''/*
 * glfx.js
 * http://evanw.github.com/glfx.js/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */
'''

def sources():
    return [os.path.join(base, f) for base, folders, files in \
        os.walk(input_path) for f in files if f.endswith('.js')]

def compile(sources):
    return '\n'.join('// %s\n%s' % (path, open(path).read()) for path in sources)

def compress_glsl(text):
    def compress(match):
        text = match.group(0)
        if '  ' in text: # assume all strings with two consecutive spaces are glsl
            text = re.sub('/\*.*?\*/', '', text) # remove all comments
            text = re.sub(' +', ' ', text) # replace consecutive spaces with one space
            text = re.sub(r' ?(\+|\-|\*|/|,|=|{|}|;|\(|\)|<|>|!|\'|\") ?', r'\1', text) # tighten spaces around some tokens
        return text

    text = re.sub(r"('([^'\\]|\\(.|\n))*'|\"([^\"\\]|\\(.|\n))*\")", compress, text) # replace all strings
    return text

def build():
    data = 'var %s = (function() {\nvar exports = {};\n\n' % module + compile(sources()) + '\nreturn exports;\n})();\n'
    if 'release' in sys.argv:
        f1, temp1_path = tempfile.mkstemp()
        f2, temp2_path = tempfile.mkstemp()
        os.write(f1, data)
        os.close(f1)
        os.close(f2)
        os.system('closure --js %s --js_output_file %s' % (temp1_path, temp2_path))
        os.remove(temp1_path)
        data = open(temp2_path).read()
        os.remove(temp2_path)
        data = compress_glsl(data)
    data = header + data
    open(output_path, 'w').write(data)
    print 'built %s (%u lines)' % (output_path, len(data.split('\n')))

def stat():
    return [os.stat(file).st_mtime for file in sources()]

def monitor():
    a = stat()
    while True:
        time.sleep(0.5)
        b = stat()
        if a != b:
            a = b
            build()

if __name__ == '__main__':
    build()
    if 'debug' in sys.argv:
        monitor()
