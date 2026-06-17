import {Config} from '@remotion/cli/config';

// Required for WebGL/three.js rendering in headless Chrome
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
