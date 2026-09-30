import { StyleSheet, Text, View } from 'react-native';

import {
  AGES,
  BROWS,
  CHEEKS,
  EARRINGS,
  EYE_COLORS,
  EYES,
  FACE_SHAPES,
  FACIAL_HAIR,
  GLASSES,
  HAIR_COLOR_LABELS,
  HAIR_GROUPS,
  HAIRS,
  HEADWEAR,
  MOUTHS,
  NECKWEAR,
  NOSES,
  PATTERNS,
  SKINS,
  TOPS,
} from '@/lib/avatar';
import { colors, fonts, palettes } from '@/theme';
import type { FullAvatar, Person } from '@/types';
import { Avatar } from '../Avatar';
import { OptionTile, Section, Swatch } from './pickers';

/** 공방 생김새 단계(얼굴·머리·옷)의 탭 목록과 탭별 선택지. 아이 아바타 꾸미기에서도 같이 쓴다. */
export type LookTab =
  | 'age'
  | 'shape'
  | 'skin'
  | 'eyes'
  | 'eyeColor'
  | 'brows'
  | 'noseMouth'
  | 'cheeks'
  | 'beard'
  | 'style'
  | 'hairColor'
  | 'top'
  | 'color'
  | 'pattern'
  | 'glasses'
  | 'headwear'
  | 'neck'
  | 'earrings'
  | 'nameTag';

export function lookTabs(step: 'face' | 'hair' | 'outfit' | string): { id: LookTab; label: string }[] {
  if (step === 'face')
    return [
      { id: 'age', label: '나이' },
      { id: 'shape', label: '얼굴형' },
      { id: 'skin', label: '피부' },
      { id: 'eyes', label: '눈' },
      { id: 'eyeColor', label: '눈동자' },
      { id: 'brows', label: '눈썹' },
      { id: 'noseMouth', label: '코·입' },
      { id: 'cheeks', label: '볼·점' },
      { id: 'beard', label: '수염' },
    ];
  if (step === 'hair')
    return [
      { id: 'style', label: '머리 모양' },
      { id: 'hairColor', label: '머리색' },
    ];
  if (step === 'outfit')
    return [
      { id: 'top', label: '옷' },
      { id: 'color', label: '옷 색' },
      { id: 'pattern', label: '무늬' },
      { id: 'glasses', label: '안경' },
      { id: 'headwear', label: '머리 장식' },
      { id: 'neck', label: '목' },
      { id: 'earrings', label: '귀걸이' },
      { id: 'nameTag', label: '이름표' },
    ];
  return [];
}

type SetLook = <K extends keyof FullAvatar>(k: K, v: FullAvatar[K]) => void;

/** 한 줄 옵션 모음: 미리보기 모양(crop)으로 각 선택지를 보여준다 */
function Choices<K extends keyof FullAvatar>({
  title,
  field,
  options,
  avatar,
  setLook,
  view = 'face',
  width,
}: {
  title: string;
  field: K;
  options: { id: FullAvatar[K]; label: string }[];
  avatar: FullAvatar;
  setLook: SetLook;
  view?: 'face' | 'zoom' | 'body' | 'full' | 'mouth';
  width?: number;
}) {
  return (
    <Section title={title}>
      {options.map((o) => {
        const a = { ...avatar, [field]: o.id } as FullAvatar;
        return (
          <OptionTile key={String(o.id)} label={o.label} selected={avatar[field] === o.id} onPress={() => setLook(field, o.id)} width={width}>
            {view === 'body' ? <BodyCrop avatar={a} /> : view === 'full' ? <Avatar avatar={a} size={56} /> : <Crop avatar={a} zoom={view === 'zoom'} mouth={view === 'mouth'} />}
          </OptionTile>
        );
      })}
    </Section>
  );
}

function ColorChoices<K extends 'hairColor' | 'shirt'>({
  title,
  field,
  colors: list,
  labels,
  avatar,
  setLook,
}: {
  title: string;
  field: K;
  colors: string[];
  labels?: string[];
  avatar: FullAvatar;
  setLook: SetLook;
}) {
  return (
    <Section title={title}>
      {list.map((c, i) => (
        <OptionTile key={c} label={labels?.[i]} selected={avatar[field] === c} onPress={() => setLook(field, c as FullAvatar[K])} width={labels ? 70 : 58}>
          <Swatch color={c} size={labels ? 36 : 34} />
        </OptionTile>
      ))}
    </Section>
  );
}

/** 생김새 단계의 탭별 선택지 */
export function LookOptions({ tab, avatar, setLook, kind }: { tab: LookTab; avatar: FullAvatar; setLook: SetLook; kind: Person['kind'] }) {
  const plain = { ...avatar, headwear: 'none' as const, glasses: 'none' as const };
  switch (tab) {
    case 'age':
      return <Choices title="나이" field="age" options={AGES} avatar={avatar} setLook={setLook} view="full" width={116} />;
    case 'shape':
      return <Choices title="얼굴형" field="faceShape" options={FACE_SHAPES} avatar={{ ...plain, hair: 'buzz' }} setLook={setLook} />;
    case 'skin':
      return (
        <Section title="피부">
          {SKINS.map((s) => (
            <OptionTile key={s} selected={avatar.skin === s} onPress={() => setLook('skin', s)} width={58}>
              <Swatch color={palettes.skins[s]} size={34} />
            </OptionTile>
          ))}
        </Section>
      );
    case 'eyes':
      return <Choices title="눈" field="eyes" options={EYES} avatar={plain} setLook={setLook} view="zoom" />;
    case 'eyeColor':
      return <Choices title="눈동자 색" field="eyeColor" options={EYE_COLORS} avatar={{ ...plain, eyes: avatar.eyes === 'dot' || avatar.eyes === 'smile' ? 'big' : avatar.eyes }} setLook={setLook} view="zoom" />;
    case 'brows':
      return <Choices title="눈썹" field="brows" options={BROWS} avatar={plain} setLook={setLook} view="zoom" />;
    case 'noseMouth':
      return (
        <>
          <Choices title="코" field="nose" options={NOSES} avatar={plain} setLook={setLook} view="mouth" />
          <Choices title="입" field="mouth" options={MOUTHS} avatar={plain} setLook={setLook} view="mouth" />
        </>
      );
    case 'cheeks':
      return <Choices title="볼·점" field="cheeks" options={CHEEKS} avatar={plain} setLook={setLook} view="mouth" />;
    case 'beard':
      return <Choices title="수염" field="facialHair" options={FACIAL_HAIR} avatar={plain} setLook={setLook} />;
    case 'style':
      return (
        <>
          {HAIR_GROUPS.map((g) => (
            <Choices key={g} title={g} field="hair" options={HAIRS.filter((h) => h.group === g)} avatar={plain} setLook={setLook} view="full" width={80} />
          ))}
        </>
      );
    case 'hairColor':
      return <ColorChoices title="머리색" field="hairColor" colors={palettes.hairColors} labels={HAIR_COLOR_LABELS} avatar={avatar} setLook={setLook} />;
    case 'top':
      return <Choices title="옷" field="top" options={TOPS} avatar={{ ...avatar, neckwear: 'none' }} setLook={setLook} view="body" />;
    case 'color':
      return <ColorChoices title="옷 색" field="shirt" colors={palettes.shirts} avatar={avatar} setLook={setLook} />;
    case 'pattern':
      return <Choices title="무늬" field="pattern" options={PATTERNS} avatar={avatar} setLook={setLook} view="body" />;
    case 'glasses':
      return <Choices title="안경" field="glasses" options={GLASSES} avatar={{ ...avatar, headwear: 'none' }} setLook={setLook} view="zoom" />;
    case 'headwear':
      return <Choices title="머리 장식" field="headwear" options={HEADWEAR} avatar={avatar} setLook={setLook} view="full" />;
    case 'neck':
      return <Choices title="목 장식" field="neckwear" options={NECKWEAR} avatar={avatar} setLook={setLook} view="body" />;
    case 'earrings':
      return <Choices title="귀걸이" field="earrings" options={EARRINGS} avatar={{ ...plain, hair: 'slick' }} setLook={setLook} />;
    case 'nameTag':
      return kind === 'teacher' ? (
        <Choices
          title="이름표"
          field="nameTag"
          options={[
            { id: false, label: '없음' },
            { id: true, label: '달기' },
          ]}
          avatar={avatar}
          setLook={setLook}
          view="body"
        />
      ) : (
        <Text style={styles.helper}>이름표는 선생님만 달 수 있어요</Text>
      );
  }
}

/** 얼굴이 잘 보이도록 자른 미리보기 (zoom: 눈 주변을 크게) */
function Crop({ avatar, zoom, mouth }: { avatar: FullAvatar; zoom?: boolean; mouth?: boolean }) {
  const size = zoom || mouth ? 104 : 78;
  return (
    <View style={{ width: 62, height: zoom || mouth ? 40 : 58, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ marginTop: mouth ? -52 : zoom ? -44 : -12 }}>
        <Avatar avatar={avatar} size={size} />
      </View>
    </View>
  );
}

/** 옷만 보이도록 자른 미리보기 */
function BodyCrop({ avatar }: { avatar: FullAvatar }) {
  return (
    <View style={{ width: 62, height: 46, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ marginTop: -60 }}>
        <Avatar avatar={avatar} size={92} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
});
