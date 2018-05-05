import VideoEntity from '@src/model/entity/video-entity';
import AudioEntity, { AudioEntityFactory } from '@src/model/entity/audio-entity';
import { AbstractBaseEntity, IBaseEntityOptions } from '@src/model/entity/abstract-base-entity';
import { IJsonPage, IJsonPageAudio, IJsonPageVideo } from '@data/json/data-pages';
import { IDataRepository } from '@src/model/repository/data-repository';

export class PageEntityFactory {
    static createFromJson(data: IJsonPage, repository: IDataRepository, options: IPageEntityOptions): PageEntity {
        return new PageEntity(data, repository, options);
    }
}

export interface IPageEntityData extends IJsonPage {}

export interface IPageEntityOptions extends IBaseEntityOptions {}

export default class PageEntity extends AbstractBaseEntity {
    protected readonly data: IPageEntityData;
    protected readonly repository: IDataRepository;

    constructor(data: IPageEntityData, repository: IDataRepository, options: IPageEntityOptions) {
        super(options);
        this.data = data;
        // TO do remove this and use IoC container when time
        this.repository = repository;
    }

    get pageId(): string {
        return this.data.page_id;
    }

    get videos(): IJsonPageVideo[] {
        return this.data.content.videos || [];
    }

    getName(lang?: string): string {
        return this.getHelper().getLocalizedValue(this.data.name, lang) || '';
    }

    getTitle(lang?: string): string {
        return this.getHelper().getLocalizedValue(this.data.title, lang) || '';
    }

    getKeywords(lang?: string): string[] {
        return this.getHelper().getLocalizedValue(this.data.keywords) || [];
    }

    countVideos(): number {
        return this.data.content.videos.length || 0;
    }

    getFirstVideo(lang?: string): VideoEntity | undefined {
        const firstVideo = this.getHelper().getLocalizedValue(this.videos[0].lang_video_id, lang);
        return this.repository.getVideoEntity(firstVideo);
    }

    getVideos(lang?: string): VideoEntity[] {
        if (this.countVideos() === 0) {
            return [];
        }
        const videos: VideoEntity[] = [];
        this.videos.forEach(({ lang_video_id }) => {
            const videoId = this.getHelper().getLocalizedValue(lang_video_id, lang);
            const videoJson = this.repository.getVideoEntity(videoId);
            if (videoJson !== undefined) {
                videos.push(videoJson);
            }
        });
        return videos;
    }

    hasAudio(): boolean {
        return this.data.content.audio !== undefined;
    }

    getAudioEntity(): AudioEntity | undefined {
        if (!this.hasAudio()) {
            return undefined;
        }
        return AudioEntityFactory.createFromJson(this.data.content.audio as IJsonPageAudio, this.options);
    }
}
