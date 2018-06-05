import * as React from 'react';
import { MediaPlayerActions } from '../../../components/player/media-player';
import './controlbar.scss';
import { ProgressBar } from '@src/shared/player/controls/progress-bar';
import PlayButton from '@src/shared/player/controls/play-button';
import PauseButton from '@src/shared/player/controls/pause-button';
import PrevButton from '@src/shared/player/controls/prev-button';
import NextButton from '@src/shared/player/controls/next-button';

export type MediaPlayerControlBarProps = {
    videoEl?: HTMLVideoElement;
    duration: number;
    currentTime: number;
    isPlaying: boolean;
    playbackRate: number;
    actions: MediaPlayerActions;
};

export type MediaPlayerControlbarState = {
    currentTime: number;
};

export default class Controlbar extends React.Component<MediaPlayerControlBarProps, MediaPlayerControlbarState> {
    readonly state: MediaPlayerControlbarState;

    /**
     * Whether the video listeners have been registered
     */
    protected listenersRegistered: boolean = false;

    constructor(props: MediaPlayerControlBarProps) {
        super(props);
        this.state = {
            currentTime: 0,
        };
    }

    componentDidMount() {
        // If videoEl is initially available, let's register listeners at mount
        if (this.props.videoEl) {
            this.registerVideoListeners(this.props.videoEl);
        }
    }

    componentDidUpdate(prevProps: MediaPlayerControlBarProps, prevState: MediaPlayerControlbarState): void {
        // In case of videoEl was not available at initial render
        // listeners will be initialized at update
        if (!prevProps.videoEl && this.props.videoEl) {
            this.registerVideoListeners(this.props.videoEl);
        }
    }

    componentWillUnmount() {
        // Removing the video listeners if they were registered
        if (this.props.videoEl && this.listenersRegistered) {
            this.unregisterVideoListeners(this.props.videoEl);
            this.listenersRegistered = false;
        }
    }

    render() {
        const props = this.props;
        const activeStyle = {
            border: '3px solid yellow',
        };

        return (
            <div className="control-bar">
                <div>
                    <PrevButton isEnabled={false} />
                </div>
                <div>
                    <PlayButton isEnabled={true} onClick={this.play} style={props.isPlaying ? activeStyle : {}} />
                </div>
                <div>
                    <PauseButton isEnabled={true} onClick={this.pause} style={props.isPlaying ? {} : activeStyle} />
                </div>
                <div>
                    <ProgressBar currentTime={this.state.currentTime} duration={props.duration} onSeek={this.seekTo} />
                </div>
                <div>
                    {this.formatMilliseconds(this.state.currentTime)}/{this.formatMilliseconds(props.duration)}
                </div>
                <div>
                    <select
                        onChange={(e: React.SyntheticEvent<HTMLSelectElement>) => {
                            console.log('onchange', e.currentTarget.value);
                            props.actions.setPlaybackRate(parseFloat(e.currentTarget.value));
                        }}
                    >
                        <option value="1">1</option>
                        <option value="0.5">0.5</option>
                        <option value="0.25">0.25</option>
                    </select>
                </div>
                <div>
                    <NextButton isEnabled={false} />
                </div>
            </div>
        );
    }

    protected registerVideoListeners(video: HTMLVideoElement, skipOnRegistered: boolean = true): void {
        if (skipOnRegistered && this.listenersRegistered) {
            return;
        }
        video.addEventListener('timeupdate', this.updateCurrentTimeState);
        this.listenersRegistered = true;
    }

    protected unregisterVideoListeners(video: HTMLVideoElement): void {
        video.removeEventListener('timeupdate', this.updateCurrentTimeState);
        this.listenersRegistered = false;
    }

    /**
     * Update local state with current time from
     * @param {Event<HTMLVideoElement>} e
     */
    protected updateCurrentTimeState = (e: Event): void => {
        if (e.target !== null && 'currentTime' in e.target) {
            const { currentTime } = e.target as HTMLVideoElement;
            this.setState((prevState, prevProps) => {
                return { ...prevState, currentTime: currentTime };
            });
        } else {
            console.warn("Cannot update currentTime state, no 'event.target.currentTime' available", e);
        }
    };

    protected formatMilliseconds(milli: number): string {
        const d = Math.trunc(milli);
        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor((d % 3600) % 60);
        const minutes = m.toString().padStart(h > 0 ? 2 : 1, '0');
        const seconds = s.toString().padStart(2, '0');
        const hDisplay = h > 0 ? `${h}:` : '';
        const mDisplay = m > 0 ? `${minutes}:` : `${'0'.padStart(m > 0 ? 2 : 1, '0')}:`;
        const sDisplay = s > 0 ? `${seconds}` : '00';
        return `${hDisplay}${mDisplay}${sDisplay}`;
    }

    protected play = () => {
        const { videoEl } = this.props;
        if (videoEl) {
            videoEl.play();
        } else {
            this.logWarning('Cannot play video, videoEl have not been registered');
        }

        this.props.actions.play();
    };

    protected pause = () => {
        const { videoEl } = this.props;
        if (videoEl) {
            videoEl.pause();
        } else {
            this.logWarning('Cannot pause video, videoEl have not been registered');
        }
        this.props.actions.pause();
    };

    protected seekTo = (time: number) => {
        const { videoEl } = this.props;
        if (videoEl) {
            videoEl.currentTime = time;
        } else {
            this.logWarning('Cannot seek to time, videoEl have not been registered');
        }
    };

    protected logWarning(msg: string) {
        console.warn(`Controlbar: ${msg}`);
    }
}
