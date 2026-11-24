import React from 'react';
import {Composition} from 'remotion';
import './theme';
import {Reel3D, type Reel3DProps} from './Reel3D';
import {FPS, H, W} from './theme';

const placeholder: Reel3DProps = {handle: '@yourhandle', avatar: 'AP', subtitle: '--props=public/props.json', end: 2, words: [], chapters: [{name: 'savol', at: 0}], scenes: [{from: 0, to: 2, items: []}]};

export const RemotionRoot: React.FC = () => (
  <Composition id="Reel3D" component={Reel3D} width={W} height={H} fps={FPS} durationInFrames={60} defaultProps={placeholder}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil((props as unknown as Reel3DProps).end * FPS)})} />
);
