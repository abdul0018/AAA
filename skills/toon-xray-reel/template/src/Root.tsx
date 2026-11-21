import React from 'react';
import {Composition} from 'remotion';
import {ToonReel, totalFrames, FPS} from './ToonReel';
import type {ToonProps} from './types';
import './fonts';

const placeholder: ToonProps = {handle: '@yourhandle', shots: [{dur: 2, layers: []}]};

export const RemotionRoot: React.FC = () => (
  <Composition id="ToonReel" component={ToonReel} width={1080} height={1920} fps={FPS} durationInFrames={60}
    defaultProps={placeholder}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames(props as unknown as ToonProps)})} />
);
