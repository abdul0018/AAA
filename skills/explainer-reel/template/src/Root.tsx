import React from 'react';
import {Composition} from 'remotion';
import {ExplainerReel, totalFrames} from './ExplainerReel';
import {FPS, H, W} from './theme';
import type {ReelProps} from './types';

// Real content always comes from `--props=public/props.json` (studio, still and render).
const placeholder: ReelProps = {
  handle: '@yourhandle',
  scenes: [{dur: 3, titles: [{text: '--props=public/props.json', at: 0.2, size: 48, underline: true}]}],
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ExplainerReel"
    component={ExplainerReel}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={90}
    defaultProps={placeholder}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames(props as unknown as ReelProps)})}
  />
);
