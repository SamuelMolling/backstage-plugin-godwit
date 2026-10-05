import { useCallback, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import { EmptyState, InfoCard, Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import { godwitApiRef } from '../api/GodwitApi';
import { TargetSummary } from '../api/types';
import { DriftPanel } from './DriftPanel';
import { GodwitLinks, useGodwitLinks } from './links';
import { RunsTable } from './RunsTable';
import { TargetOverview } from './TargetOverview';

export interface GodwitTargetsViewProps {
  targets: string[];
  maxRuns?: number;
}

interface TargetCardProps {
  target: string;
  summaries: AsyncState<TargetSummary[]>;
  maxRuns: number;
  links: GodwitLinks;
  reload: number;
  onRefresh: () => void;
}

const CardActions = ({
  target,
  links,
  onRefresh,
}: {
  target: string;
  links: GodwitLinks;
  onRefresh: () => void;
}) => {
  const open = links.target(target);

  return (
    <>
      {open && (
        <Link to={open} target="_blank" rel="noopener noreferrer">
          Open in godwit
        </Link>
      )}
      <Button size="small" aria-label={`Refresh ${target}`} onClick={onRefresh}>
        Refresh
      </Button>
    </>
  );
};

const TargetCard = ({ target, summaries, maxRuns, links, reload, onRefresh }: TargetCardProps) => {
  const api = useApi(godwitApiRef);
  const status = useAsync(() => api.getTargetStatus(target), [api, target, reload]);
  const plans = useAsync(() => api.listPlans(target), [api, target, reload]);
  const events = useAsync(() => api.listDriftEvents(target), [api, target, reload]);
  const runs = useAsync(() => api.listRuns(target), [api, target, reload]);

  return (
    <InfoCard
      title={target}
      subheader="godwit target"
      action={<CardActions target={target} links={links} onRefresh={onRefresh} />}
    >
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <TargetOverview
            target={target}
            status={status}
            plans={plans}
            summaries={summaries}
            links={links}
          />
        </Grid>
        <Grid item>
          <DriftPanel target={target} events={events} status={status} links={links} />
        </Grid>
        <Grid item>
          <RunsTable target={target} runs={runs} maxRuns={maxRuns} links={links} />
        </Grid>
      </Grid>
    </InfoCard>
  );
};

export const GodwitTargetsView = ({ targets, maxRuns = 10 }: GodwitTargetsViewProps) => {
  const api = useApi(godwitApiRef);
  const links = useGodwitLinks();
  const [reload, setReload] = useState(0);
  const onRefresh = useCallback(() => setReload(n => n + 1), []);
  const summaries = useAsync(() => api.listTargets(), [api, reload]);
  const names = [...new Set(targets.map(t => t.trim()).filter(Boolean))];

  if (names.length === 0) {
    return (
      <EmptyState
        missing="info"
        title="No godwit targets"
        description="Pass the names of the godwit targets to show."
      />
    );
  }
  return (
    <Grid container spacing={3} direction="column">
      {names.map(name => (
        <Grid item key={name}>
          <TargetCard
            target={name}
            summaries={summaries}
            maxRuns={maxRuns}
            links={links}
            reload={reload}
            onRefresh={onRefresh}
          />
        </Grid>
      ))}
    </Grid>
  );
};
