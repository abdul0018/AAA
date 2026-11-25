import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {AngryReel, type AngryProps} from './AngryReel';
const ph: AngryProps = {words: [], handle: '@yourhandle', end: 2, env: []};
export const RemotionRoot: React.FC = () => (
  <Composition id="AngryReel" component={AngryReel} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={ph}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil((props as unknown as AngryProps).end * 30)})} />
);
