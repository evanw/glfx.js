#!/usr/bin/python

from jinja2 import Environment, FileSystemLoader
import traceback, cgi, time, sys, os, shutil
from docs import gen_docs

glfx_file = '../glfx.js'
source_dir = '../src/'
template_dir = './templates/'
output_dir = './glfx.js/'

html = '<style>body{margin:30px;}h1{font:26px sans-serif;}p{font:12px Verdana,sans-serif;}pre{font:12px monospace;background:#F7F7F7;border:1px solid #D7D7D7;padding:5px;}</style><h1>Error rendering %s</h1><p>An error was encountered while rendering the file <b>%s</b>.&nbsp; Here is the stack trace:</p><pre>%s</pre>'

def do(files):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    shutil.copy(glfx_file, os.path.join(output_dir, os.path.basename(glfx_file)))
    docs = gen_docs()
    for file in files:
        file = file.replace(template_dir, '')
        if file == 'base.html' or not file.endswith('.html'):
            continue
        new_file = output_dir + file
        if file != 'index.html':
            directory = output_dir + file[0:-5]
            if not os.path.exists(directory):
                os.makedirs(directory)
            new_file = directory + '/index.html'
        f = open(new_file, 'w')
        try:
            f.write(env.get_template(file).render(debug=debug, docs=docs))
            print 'success -', file
        except:
            print traceback.format_exc()
            f.write(html % (cgi.escape(file), cgi.escape(os.getcwd() + '/' + file), cgi.escape(traceback.format_exc())))
            print 'error -', file
        f.close()

def stat(files):
    return [os.stat(file).st_mtime for file in files]

def findfiles(path, ext):
    return [os.path.join(base, f) for base, folders, files in \
        os.walk(path) for f in files if f.endswith(ext)]

def files():
    return findfiles(source_dir, '.js') + findfiles(template_dir, '.html') + [glfx_file]

debug = 'debug' in sys.argv
env = Environment(loader=FileSystemLoader(template_dir))

do(files())
if debug:
    a = stat(files())
    while True:
        time.sleep(1)
        b = stat(files())
        if a != b:
            a = b
            do(files())
