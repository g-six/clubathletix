'use client'
import { Dialog, DialogBody } from '@/components/dialog'
import { Select } from '@/components/select'
import { Match, Player, Team, TeamPlayer } from '@prisma/client'

import { Button } from '@/components/button'
import { useCallback, useState } from 'react'

const POSITIONS = [
  'ST',
  'CF',
  'LW',
  'RW',
  'LM',
  'RM',
  'CAM',
  'CM',
  'CDM',
  'RB',
  'RWB',
  'LB',
  'LWB',
  'CB',
  'RCB',
  'LCB',
  'GK',
  'SUB',
]

export function Lineup(
  props: {
    match: Match
    team: Team & { players: (TeamPlayer & { player: Player })[] }
  } & React.ComponentPropsWithoutRef<typeof Button>
) {
  const [players, setPlayers] = useState<
    {
      player_id: string
      position: string
      initials: string
      number?: string
    }[]
  >(
    props.team.players.map(({ player_id, jersey_number, player: { first_name, last_name } }) => ({
      player_id,
      position: 'SUB',
      number: jersey_number,
      initials: `${first_name[0]}${last_name[0]}`,
    }))
  )

  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)

  const [payload, setPayload] = useState<{
    [k: string]: string
  }>({
    division: '2',
    age_group: 'U13',
  })

  const [showSelector, toggleSelector] = useState(false)
  const [player, selectPlayer] = useState<string>('')

  const handleSubmit = useCallback(() => {
    toggleLoader(true)
  }, [payload])

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...props} />
      <Dialog
        open={isOpen}
        size="sm"
        onClose={() => {
          toggleLoader(false)

          setIsOpen(false)
        }}
        className="!mt-0 !p-0"
      >
        <DialogBody className="mx-auto !my-4 w-[calc(100%_-_2rem)] bg-[url(/pitch/pitch-vertical.png)] bg-contain bg-center bg-no-repeat">
          <section className="relative mx-auto flex !h-[640px] !w-[352px] flex-col justify-between">
            <Select
              name="player"
              className={showSelector ? 'mx-auto mt-8 !w-48 rounded-xl p-1 dark:bg-black' : 'hidden'}
              onChange={(evt) => selectPlayer(evt.currentTarget.value)}
            >
              <option disabled>Select player</option>
              {props.team.players.map((record) => (
                <option key={record.player_id} className="text-center">
                  {record.player.first_name}
                </option>
              ))}
            </Select>
            <div className="grid h-full grid-cols-5 pt-32">
              <div className="row-span-2 flex justify-center">
                <PlayerInField position="LW" onClick={toggleSelector} />
              </div>
              <PlayerInField position="ST" onClick={toggleSelector} />
              <PlayerInField position="ST" onClick={toggleSelector} />
              <PlayerInField position="ST" onClick={toggleSelector} />
              <div className="row-span-2 flex justify-center">
                <PlayerInField position="RW" onClick={toggleSelector} />
              </div>

              <PlayerInField position="CF" onClick={toggleSelector} />
              <PlayerInField position="CF" onClick={toggleSelector} />
              <PlayerInField position="CF" onClick={toggleSelector} />

              <div className="row-span-3 flex justify-center">
                <PlayerInField position="LM" onClick={toggleSelector} />
              </div>
              <PlayerInField position="CAM" onClick={toggleSelector} />
              <PlayerInField position="CAM" onClick={toggleSelector} />
              <PlayerInField position="CAM" onClick={toggleSelector} />

              <div className="row-span-3 flex justify-center">
                <PlayerInField position="RM" onClick={toggleSelector} />
              </div>
              <PlayerInField position="CM" onClick={toggleSelector} />
              <PlayerInField position="CM" onClick={toggleSelector} />
              <PlayerInField position="CM" onClick={toggleSelector} />

              <PlayerInField position="CDM" onClick={toggleSelector} />
              <PlayerInField position="CDM" onClick={toggleSelector} />
              <PlayerInField position="CDM" onClick={toggleSelector} />

              <div className="flex flex-col items-end justify-center">
                <PlayerInField position="LWB" onClick={toggleSelector} />
                <PlayerInField position="LB" onClick={toggleSelector} />
              </div>

              <PlayerInField position="CB" onClick={toggleSelector} />
              <PlayerInField position="CB" onClick={toggleSelector} />
              <PlayerInField position="CB" onClick={toggleSelector} />

              <div className="flex flex-col items-start justify-center">
                <PlayerInField position="RWB" onClick={toggleSelector} />
                <PlayerInField position="RB" onClick={toggleSelector} />
              </div>
            </div>
            <div className="flex w-full items-center justify-center">
              <PlayerInField position="GK" player-id="1" onClick={toggleSelector} />
            </div>
          </section>
        </DialogBody>
      </Dialog>
    </>
  )
}

function PlayerInField(props: { position: string; 'player-id'?: string; onClick(evt: unknown): void }) {
  return (
    <div data-player-id={props['player-id']} className="flex grow items-center justify-center text-center">
      <Button
        className={`h-12 w-12 cursor-pointer bg-zinc-400/10 !p-0 hover:!bg-zinc-500/50 ${props['player-id'] ? '!rounded-full' : ''}`}
        skeleton
        onClick={props.onClick}
      >
        {!['ATT', 'MID', 'DEF'].includes(props.position) && props.position}
      </Button>
    </div>
  )
}
