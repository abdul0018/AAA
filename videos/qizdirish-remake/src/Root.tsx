import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, Warmup, type WarmProps} from './Warmup';

const placeholder: WarmProps = {words: [{w: 'props', s: 0, e: 1}], handle: '@yourhandle', end: 2};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Warmup"
    component={Warmup}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={60}
    defaultProps={placeholder}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil((props as unknown as WarmProps).end * FPS)})}
  />
);
