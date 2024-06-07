"use client";

import { useEffect, useState } from "react";
import {
  useMutationWithAuth,
  useQueryWithAuth,
} from "@convex-dev/convex-lucia-auth/react";

import { api } from "@acme/api/convex/_generated/api";
import { Doc } from "@acme/api/convex/_generated/dataModel";
import MainLayout from "@acme/ui/src/components/layout/main";
import { Button } from "@acme/ui/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/src/components/ui/card";
import { Input } from "@acme/ui/src/components/ui/input";
import { Label } from "@acme/ui/src/components/ui/label";
import { useToast } from "@acme/ui/src/components/ui/use-toast";

// TODO: handle updates for the default settings of the mobile app
// TODO: 1 --> Handle default mine rate, mine hours, xp count,
// TODO: 2 --> Render each seciton in card component with input
// TODO: 3 --> Update the convex db with the user's new configurations

function ConfigPage() {
  const [miningRate, setMiningRate] = useState<number>(2);
  const [miningHours, setMiningHours] = useState<number>(6);
  const [xpCount, setXpCount] = useState<number>(1000);
  const [referralXpCount, setReferralXpCount] = useState<number>(5000);
  const [xpPerToken, setXpPerToken] = useState<number>();
  const [minimumSaleToken, setMinimumSaleToken] = useState<number>();

  const { toast } = useToast();

  const appConfig: Doc<"config"> | undefined = useQueryWithAuth(
    api.queries.getAppConfig,
    {},
  );

  const [boosts, setBoosts] = useState<
    {
      rate: number;
      title: string;
      type: string;
      uuid: string;
      xpCost: number;
    }[]
  >(
    Array.from({ length: 3 }).map((_, index) => {
      if (index === 0) {
        return {
          rate: 3,
          title: "Mining Bot",
          type: "bot",
          uuid: crypto.randomUUID(),
          xpCost: 200000,
        };
      } else if (index === 1) {
        return {
          rate: 10,
          title: "Mining Rate",
          type: "rate",
          uuid: crypto.randomUUID(),
          xpCost: 200000,
        };
      } else {
        return {
          rate: 6,
          title: "Mining Duration",
          type: "duration",
          uuid: crypto.randomUUID(),
          xpCost: 200000,
        };
      }
    }),
  );

  function setBoost(key: string, at: number, value: any) {
    const newBoosts = boosts?.map((boosts, i) => {
      if (i === at) {
        return {
          ...boosts,
          [key]: value,
        };
      } else {
        return boosts;
      }
    });

    setBoosts(newBoosts);
  }

  const updateConfigs = useMutationWithAuth(api.mutations.updateConfig);

  useEffect(() => {
    if (appConfig) {
      setMiningRate(appConfig?.miningCount);
      setMiningHours(appConfig.miningHours);
      setXpCount(appConfig.xpCount);
      setXpPerToken(appConfig?.xpPerToken);
      setMinimumSaleToken(appConfig?.minimumSaleToken);
    }

    if(appConfig && appConfig?.boosts) {
      setBoosts(appConfig?.boosts);
    }
  }, [appConfig]);

  return (
    <MainLayout>
      <div className="mt-5 flex w-full flex-col gap-8">
        <div className="h-full w-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                App Configuration
              </h2>
              <p className="text-muted-foreground">
                Configure the Enet miner mobile applications defaults(mine rate,
                xp count, referral points, e.t.c)
              </p>
            </div>
            <Button
              onClick={async () => {
                const t = toast({
                  title: "Updating config data",
                });
                await updateConfigs({
                  data: {
                    miningCount: miningRate,
                    miningHours,
                    xpCount,
                    referralXpCount,
                  },
                  configId: appConfig?._id,
                });

                t.update({ title: "Update completed!" });
              }}
            >
              Update all
            </Button>
          </div>

          {/* List of configuration cards */}
          <Card>
            <CardHeader>
              <CardTitle>Mining rate</CardTitle>
              <CardDescription>
                Change the default mining rate of users (i.e $EN/hour)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <Input
                  placeholder="Mining rate"
                  type="number"
                  value={miningRate}
                  onChange={(e) => setMiningRate(e.target.valueAsNumber)}
                />
              </form>
            </CardContent>
            {/* <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter> */}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mining hours</CardTitle>
              <CardDescription>
                Change the default mining hours per mining session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <Input
                  placeholder="Mining hours"
                  type="number"
                  value={miningHours}
                  onChange={(e) => setMiningHours(e.target.valueAsNumber)}
                />
              </form>
            </CardContent>
            {/* <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter> */}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>XP Count</CardTitle>
              <CardDescription>
                Change default XP Count after onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <Input
                  placeholder="XP Count"
                  type="number"
                  value={xpCount}
                  onChange={(e) => setXpCount(e.target.valueAsNumber)}
                />
              </form>
            </CardContent>
            {/* <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter> */}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Referral XP Count</CardTitle>
              <CardDescription>
                Change referral XP Count when users referre each other
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <Input
                  placeholder="XP Count"
                  type="number"
                  value={referralXpCount}
                  onChange={(e) => setReferralXpCount(e.target.valueAsNumber)}
                />
              </form>
            </CardContent>
            {/* <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter> */}
          </Card>
        </div>

        {/* Boost */}
        <div className="h-full w-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Boost Configuration
              </h2>
              <p className="text-muted-foreground">
                Configure the Enet miner mobile applications boost features
              </p>
            </div>
          </div>

          {boosts?.map((boost, index) => (
            <Card key={boost?.uuid}>
              <CardHeader>
                <CardTitle>{boost?.title}</CardTitle>
                {/* <CardDescription>
                  Change the default mining rate of users (i.e $EN/hour)
                </CardDescription> */}
              </CardHeader>
              <CardContent>
                <form>
                  <Label>
                    Rate
                    <Input
                      placeholder="Input rate"
                      type="number"
                      value={boost.rate}
                      onChange={(e) =>
                        setBoost("rate", index, e.target.valueAsNumber)
                      }
                    />
                  </Label>
                  <Label>
                    XP Cost
                    <Input
                      placeholder="XP Cost"
                      type="number"
                      value={boost.xpCost}
                      onChange={(e) =>
                        setBoost("xpCost", index, e.target.valueAsNumber)
                      }
                    />
                  </Label>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={async () => {
                    const t = toast({
                      title: "Updating config data",
                    });
                    await updateConfigs({
                      data: {
                        boosts,
                      },
                      configId: appConfig?._id,
                    });

                    t.update({ title: "Update completed!" });
                  }}
                >
                  Update
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* XP Sale config */}
        <div className="h-full w-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Buy XP Configuration
              </h2>
              <p className="text-muted-foreground">
                Configure the XP sale amount per $FOUND token and minimum sale
                amount
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>XP/$FOUND and Minimum amount</CardTitle>
              {/* <CardDescription>
                  Change the default mining rate of users (i.e $EN/hour)
                </CardDescription> */}
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Label className="grid gap-2">
                  XP/$FOUND
                  <Input
                    placeholder="XP/$FOUND"
                    type="number"
                    value={xpPerToken}
                    onChange={(e) => setXpPerToken(e.target.valueAsNumber)}
                  />
                </Label>
                <Label className="grid gap-2">
                  Minimum $FOUND amount to purchase XP
                  <Input
                    placeholder="Minimum $FOUND amount"
                    type="number"
                    value={minimumSaleToken}
                    onChange={(e) =>
                      setMinimumSaleToken(e.target.valueAsNumber)
                    }
                  />
                </Label>
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                onClick={async () => {
                  const t = toast({
                    title: "Updating config data",
                  });
                  await updateConfigs({
                    data: {
                      xpPerToken,
                      minimumSaleToken,
                    },
                    configId: appConfig?._id,
                  });

                  t.update({ title: "Update completed!" });
                }}
              >
                Update
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default ConfigPage;
