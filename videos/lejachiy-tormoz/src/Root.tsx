import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {BumpReel, type BumpProps} from './BumpReel';
const ph: BumpProps = {words: [], handle: '@yourhandle', end: 2};
export const RemotionRoot: React.FC = () => (
  <Composition id="BumpReel" component={BumpReel} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={ph}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil((props as unknown as BumpProps).end * 30)})} />
);
