<template>
    <div class="player" @click="toggleLyrics">
        <div
            class="progress-bar"
            :class="{
                nyancat: settings.nyancatStyle,
                'nyancat-stop': settings.nyancatStyle && !player.playing,
            }"
            @click.stop
        >
            <vue-slider
                v-model="player.progress"
                :min="0"
                :max="player.currentTrackDuration"
                :interval="1"
                :drag-on-click="true"
                :duration="0"
                :dot-size="12"
                :height="2"
                :tooltip-formatter="formatTrackTime"
                :lazy="true"
                :silent="true"
            ></vue-slider>
        </div>
        <div class="controls">
            <div class="playing">
                <div class="container">
                    <fv-image
                        :src="
                            currentTrack.al &&
                            currentTrack.al.picUrl | resizeImage(224)
                        "
                        class="img"
                        :onlazy="true"
                        @click="goToAlbum"
                    />
                    <div class="track-info" :title="audioSource" @click.stop>
                        <div
                            :class="['name', { 'has-list': hasList() }]"
                            @click="hasList() && goToList()"
                        >
                            {{ currentTrack.name }}
                        </div>
                        <div class="artist">
                            <span
                                v-for="(ar, index) in currentTrack.ar"
                                :key="ar.id"
                                @click="ar.id && goToArtist(ar.id)"
                            >
                                <span :class="{ ar: ar.id }">
                                    {{ ar.name }} </span
                                ><span
                                    v-if="index !== currentTrack.ar.length - 1"
                                    >,
                                </span>
                            </span>
                        </div>
                    </div>
                    <div class="like-button">
                        <button-icon
                            :title="$t('player.like')"
                            @click.native="likeATrack(player.currentTrack.id)"
                        >
                            <svg-icon
                                v-show="!player.isCurrentTrackLiked"
                                icon-class="heart"
                            ></svg-icon>
                            <svg-icon
                                v-show="player.isCurrentTrackLiked"
                                icon-class="heart-solid"
                            ></svg-icon>
                        </button-icon>
                    </div>
                </div>
                <div class="blank"></div>
            </div>
            <div class="middle-control-buttons">
                <div class="blank"></div>
                <div class="container" @click.stop>
                    <fv-button
                        v-show="!player.isPersonalFM"
                        :theme="theme"
                        :background="
                            theme === 'dark'
                                ? 'rgba(35, 35, 35, 0.3)'
                                : 'rgba(255, 255, 255, 0.3)'
                        "
                        :border-radius="50"
                        :title="$t('player.previous')"
                        style="width: 30px; height: 30px; margin: 10px"
                        @click.native="playPrevTrack"
                    >
                        <fv-AnimatedIcon
                            fontSize="13"
                            icon="BackSolidBold"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                    </fv-button>
                    <button-icon
                        v-show="player.isPersonalFM"
                        title="不喜欢"
                        @click.native="moveToFMTrash"
                    >
                        <svg-icon icon-class="thumbs-down" />
                    </button-icon>
                    <fv-button
                        class="play"
                        :theme="theme"
                        :background="
                            theme === 'dark'
                                ? 'rgba(35, 35, 35, 0.3)'
                                : 'rgba(255, 255, 255, 0.3)'
                        "
                        :border-radius="50"
                        :title="
                            $t(player.playing ? 'player.pause' : 'player.play')
                        "
                        @click="playOrPause"
                    >
                        <fv-AnimatedIcon
                            fontSize="16"
                            :icon="player.playing ? 'PauseBold' : 'PlaySolid'"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        :background="
                            theme === 'dark'
                                ? 'rgba(35, 35, 35, 0.3)'
                                : 'rgba(255, 255, 255, 0.3)'
                        "
                        :border-radius="50"
                        :title="$t('player.next')"
                        style="width: 30px; height: 30px; margin: 10px"
                        @click.native="playNextTrack"
                    >
                        <fv-AnimatedIcon
                            fontSize="13"
                            icon="ForwardSolidBold"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                    </fv-button>
                </div>
                <div class="blank"></div>
            </div>
            <div class="right-control-buttons">
                <div class="blank"></div>
                <div class="container" @click.stop>
                    <fv-button
                        :theme="theme"
                        :background="
                            theme === 'dark'
                                ? 'rgba(35, 35, 35, 0.3)'
                                : 'rgba(255, 255, 255, 0.3)'
                        "
                        :border-radius="50"
                        :title="$t('player.nextUp')"
                        :disabled="player.isPersonalFM"
                        style="width: 30px; height: 30px; margin: 5px"
                        @click.native="goToNextTracksPage"
                    >
                        <fv-AnimatedIcon
                            fontSize="13"
                            icon="MusicInfo"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                    </fv-button>
                    <fv-button
                        :theme="player.repeatMode === 'on' ? 'dark' : theme"
                        :background="
                            player.repeatMode === 'on'
                                ? 'rgba(0, 98, 158, 0.3)'
                                : theme === 'dark'
                                ? 'rgba(35, 35, 35, 0.3)'
                                : 'rgba(255, 255, 255, 0.3)'
                        "
                        :border-radius="50"
                        :title="
                            player.repeatMode === 'one'
                                ? $t('player.repeatTrack')
                                : $t('player.repeat')
                        "
                        :disabled="player.isPersonalFM"
                        style="width: 30px; height: 30px; margin: 5px"
                        @click.native="switchRepeatMode"
                    >
                        <fv-AnimatedIcon
                            v-show="player.repeatMode !== 'one'"
                            fontSize="13"
                            icon="RepeatAll"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                        <fv-AnimatedIcon
                            v-show="player.repeatMode === 'one'"
                            fontSize="13"
                            icon="RepeatOne"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                    </fv-button>
                    <fv-button
                        :theme="player.shuffle ? 'dark' : theme"
                        :background="
                            player.shuffle
                                ? 'rgba(0, 98, 158, 0.3)'
                                : theme === 'dark'
                                ? 'rgba(35, 35, 35, 0.3)'
                                : 'rgba(255, 255, 255, 0.3)'
                        "
                        :border-radius="50"
                        :title="$t('player.shuffle')"
                        :disabled="player.isPersonalFM"
                        style="width: 30px; height: 30px; margin: 5px"
                        @click.native="switchShuffle"
                    >
                        <fv-AnimatedIcon
                            fontSize="13"
                            icon="Shuffle"
                            :hideContent="true"
                        >
                        </fv-AnimatedIcon>
                    </fv-button>
                    <button-icon
                        v-if="settings.enableReversedMode"
                        :class="{
                            active: player.reversed,
                            disabled: player.isPersonalFM,
                        }"
                        :title="$t('player.reversed')"
                        @click.native="switchReversed"
                    >
                        <svg-icon icon-class="sort-up" />
                    </button-icon>
                    <div class="volume-control">
                        <button-icon
                            :title="$t('player.mute')"
                            @click.native="mute"
                        >
                            <svg-icon
                                v-show="volume > 0.5"
                                icon-class="volume"
                            />
                            <svg-icon
                                v-show="volume === 0"
                                icon-class="volume-mute"
                            />
                            <svg-icon
                                v-show="volume <= 0.5 && volume !== 0"
                                icon-class="volume-half"
                            />
                        </button-icon>
                        <div class="volume-bar">
                            <vue-slider
                                v-model="volume"
                                :min="0"
                                :max="1"
                                :interval="0.01"
                                :drag-on-click="true"
                                :duration="0"
                                tooltip="none"
                                :dot-size="12"
                            ></vue-slider>
                        </div>
                    </div>

                    <button-icon
                        class="lyrics-button"
                        title="歌词"
                        style="margin-left: 12px"
                        @click.native="toggleLyrics"
                    >
                        <svg-icon icon-class="arrow-up" />
                    </button-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import "@/assets/css/slider.css";

import ButtonIcon from "@/components/ButtonIcon.vue";
import VueSlider from "vue-slider-component";
import { goToListSource, hasListSource } from "@/utils/playList";

export default {
    name: "Player",
    components: {
        ButtonIcon,
        VueSlider,
    },
    computed: {
        ...mapState(["player", "settings", "data"]),
        currentTrack() {
            return this.player.currentTrack;
        },
        volume: {
            get() {
                return this.player.volume;
            },
            set(value) {
                this.player.volume = value;
            },
        },
        playing() {
            return this.player.playing;
        },
        audioSource() {
            return this.player._howler?._src.includes("kuwo.cn")
                ? "音源来自酷我音乐"
                : "";
        },
        theme() {
            let theme = this.settings.appearance;
            if (theme !== "auto") return theme;
            return document.body.getAttribute("data-theme");
        },
    },
    methods: {
        ...mapMutations(["toggleLyrics"]),
        ...mapActions(["showToast", "likeATrack"]),
        playPrevTrack() {
            this.player.playPrevTrack();
        },
        playOrPause() {
            this.player.playOrPause();
        },
        playNextTrack() {
            if (this.player.isPersonalFM) {
                this.player.playNextFMTrack();
            } else {
                this.player.playNextTrack();
            }
        },
        goToNextTracksPage() {
            if (this.player.isPersonalFM) return;
            this.$route.name === "next"
                ? this.$router.go(-1)
                : this.$router.push({ name: "next" });
        },
        formatTrackTime(value) {
            if (!value) return "";
            let min = ~~((value / 60) % 60);
            let sec = (~~(value % 60)).toString().padStart(2, "0");
            return `${min}:${sec}`;
        },
        hasList() {
            return hasListSource();
        },
        goToList() {
            goToListSource();
        },
        goToAlbum() {
            if (this.player.currentTrack.al.id === 0) return;
            this.$router.push({
                path: "/album/" + this.player.currentTrack.al.id,
            });
        },
        goToArtist(id) {
            this.$router.push({ path: "/artist/" + id });
        },
        moveToFMTrash() {
            this.player.moveToFMTrash();
        },
        switchRepeatMode() {
            this.player.switchRepeatMode();
        },
        switchShuffle() {
            this.player.switchShuffle();
        },
        switchReversed() {
            this.player.switchReversed();
        },
        mute() {
            this.player.mute();
        },
    },
};
</script>

<style lang="scss" scoped>
.player {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 64px;
    backdrop-filter: saturate(180%) blur(30px);
    // background-color: rgba(255, 255, 255, 0.86);
    background-color: var(--color-navbar-bg);
    z-index: 100;
}

@supports (-moz-appearance: none) {
    .player {
        background-color: var(--color-body-bg);
    }
}

.progress-bar {
    margin-top: -6px;
    margin-bottom: -6px;
    width: 100%;
}

.controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    height: 100%;
    padding: {
        right: 10vw;
        left: 10vw;
    }
}

@media (max-width: 1336px) {
    .controls {
        padding: 0 5vw;
    }
}

.blank {
    flex-grow: 1;
}

.playing {
    display: flex;
}

.playing .container {
    display: flex;
    align-items: center;
    user-select: none;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
        background: rgba(120, 120, 120, 0.1);
    }

    &:active {
        background: rgba(120, 120, 120, 0.2);
    }

    .img {
        width: 46px;
        height: 46px;
        border-radius: 5px;
        box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
        cursor: pointer;
        user-select: none;
    }
    .track-info {
        height: 46px;
        margin-left: 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .name {
            font-weight: 600;
            font-size: 16px;
            opacity: 0.88;
            color: var(--color-text);
            margin-bottom: 4px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
        }
        .has-list {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }
        .artist {
            font-size: 12px;
            opacity: 0.58;
            color: var(--color-text);
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
            span.ar {
                cursor: pointer;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}

.middle-control-buttons {
    display: flex;
}

.middle-control-buttons .container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 8px;
    .button-icon {
        margin: 0 8px;
    }

    .play {
        height: 42px;
        width: 42px;

        .svg-icon {
            width: 20px;
            height: 20px;
        }
    }
}

.right-control-buttons {
    display: flex;
}

.right-control-buttons .container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .expand {
        margin-left: 24px;
        .svg-icon {
            height: 24px;
            width: 24px;
        }
    }
    .active .svg-icon {
        color: var(--color-primary);
    }
    .volume-control {
        margin-left: 4px;
        display: flex;
        align-items: center;
        .volume-bar {
            width: 84px;
        }
    }
}

.like-button {
    margin-left: 16px;
}

.button-icon.disabled {
    cursor: default;
    opacity: 0.38;
    &:hover {
        background: none;
    }
    &:active {
        transform: unset;
    }
}
</style>
