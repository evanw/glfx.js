# glfx.js
Adjust photos in your browser in realtime with glfx.js, an image effects library powered by WebGL. It uses your graphics card for image effects that would be impossible to apply in real-time with JavaScript alone.

There are two caveats to glfx.js. First, WebGL is a new technology that is only available in the latest browsers and it will be quite a while before the majority of users have it. Second, due to the same origin policy, JavaScript is only allowed to read images that originate from the same domain as the script reading them, so you may have to host the images you modify.

[Live Demo](http://evanw.github.com/glfx.js/demo/)
