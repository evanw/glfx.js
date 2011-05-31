#!/usr/bin/python

module = 'fx'
input_path = 'src/'
output_path = 'glfx.js'

import re, os, sys, time, tempfile

def sources():
    return [os.path.join(base, f) for base, folders, files in \
        os.walk(input_path) for f in files if f.endswith('.js')]

def compile(sources):
    return '\n'.join('// %s\n%s' % (path, open(path).read()) for path in sources)

def build():
    data = ('var %s = (function() {\nvar exports = {};\n\n' + compile(sources()) + '\nreturn exports;\n})();\n') % module
    if 'release' in sys.argv:
        f, temp_path = tempfile.mkstemp()
        os.write(f, data)
        os.close(f)
        os.system('closure --js %s --js_output_file %s' % (temp_path, output_path))
        os.remove(temp_path)
    else:
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
