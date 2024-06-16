"use client";

import React, { useEffect, useState } from "react";
import {
  useMutationWithAuth,
  useQueryWithAuth,
} from "@convex-dev/convex-lucia-auth/react";
import {
  // CaretSortIcon,
  DotsHorizontalIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { UploadButton, UploadFileResponse } from "@xixixao/uploadstuff/react";
import {
  FaCheckDouble,
  FaDiscord,
  FaGlobe,
  FaTelegram,
  FaX,
  FaXTwitter,
} from "react-icons/fa6";

import type { Doc, Id } from "@acme/api/convex/_generated/dataModel";
import { api } from "@acme/api/convex/_generated/api";
import MainLayout from "@acme/ui/src/components/layout/main";
import { Button } from "@acme/ui/src/components/ui/button";
import { Checkbox } from "@acme/ui/src/components/ui/checkbox";
import { DataTable } from "@acme/ui/src/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/src/components/ui/dropdown-menu";
import { Input } from "@acme/ui/src/components/ui/input";
import { Label } from "@acme/ui/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/src/components/ui/select";
import { Textarea } from "@acme/ui/src/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@acme/ui/src/components/ui/toggle-group";
import { cn } from "@acme/ui/src/lib/utils";

// import addHours from "date-fns/esm/addHours";

type EventType = Partial<Doc<"events">> & {
  company: Partial<Doc<"company">> & { logoUrl: string };
};
type Network = "twitter" | "discord" | "telegram" | "website";
type ActionType = "follow" | "post" | "join" | "visit";

export default function Events() {
  const events: EventType[] | undefined = useQueryWithAuth(
    api.adminQueries.fetchEvents,
    {},
  );

  const deleteEvent = useMutationWithAuth(api.adminMutations.deleteEventWithId);

  // Editable modal open state
  const [open, setOpen] = useState<boolean>(false);
  const [editableEvent, setEditableEvent] = useState<EventType | null>(null);
  // const [editableActions, setEditableActions] = useState<
  //   { name: string; link: string; channel: Network; type: ActionType }[]
  // >([]);

  const cleanupEventEditableState = () => setEditableEvent(null);

  // Toggle event edit dialog
  useEffect(() => {
    if (editableEvent) {
      setOpen(true);
    }
  }, [editableEvent]);

  const columns: ColumnDef<EventType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "reward",
      header: "Reward",
      cell: ({ row }) => {
        const reward: number = row.getValue("reward");
        return (
          <div className="uppercase">XP {reward.toLocaleString("en-US")}</div>
        );
      },
    },
    {
      id: "count",
      // accessorKey: "company",
      accessorFn: (row) => (row?.actions ?? []).length,
      header: "Action count",
      cell: ({ getValue }) => {
        const count = getValue() as number;
        return count.toLocaleString("en-US");
      },
    },
    {
      id: "company_name",
      header: "Company Name",
      accessorFn: (row) => row.company.name,
      cell: ({ getValue }) => {
        const companyName = getValue() as string;

        return <div className="capitalize">{companyName}</div>;
      },
    },
    {
      id: "company_logo",
      header: "Company logo",
      accessorFn: (row) => row.company?.logoUrl,
      cell: ({ getValue }) => {
        const logoUrl = getValue() as string;

        return (
          <img src={logoUrl} alt="Logo url" className="h-8 w-8 rounded-lg" />
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original;

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="mb-1 hover:cursor-pointer"
                  onClick={() => {
                    // setEditableTaskIndex(row.index);
                    setEditableEvent(event);
                  }}
                >
                  Edit event
                </DropdownMenuItem>

                {/* <DropdownMenuItem>View customer</DropdownMenuItem> */}
                <DropdownMenuItem
                  className="bg-red-500 hover:cursor-pointer"
                  onClick={async () => {
                    await deleteEvent({ eventId: event._id as Id<"events"> });
                  }}
                >
                  Delete event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <div className="mt-5 flex w-full flex-col gap-8">
        <div className="h-full w-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Events</h2>
              <p className="text-muted-foreground">
                Here&apos;s a list of all events that will show up in the mobile
                app
              </p>
            </div>
          </div>
          <DataTable
            filterVisible={false}
            data={events ?? []}
            columns={columns}
            extra={
              <Button className="gap-1" onClick={() => setOpen(true)}>
                <PlusIcon className="h-4 w-4 font-bold" /> Add event
              </Button>
            }
          />
        </div>
        <CompanyTable />
        <EventDialog
          open={open}
          event={editableEvent}
          onOpenChange={(open) => setOpen(open)}
          closeCleanup={cleanupEventEditableState}
        />
      </div>
    </MainLayout>
  );
}

function CompanyTable() {
  const companies = useQueryWithAuth(api.adminQueries.fetchCompanies, {});
  const deleteCompany = useMutationWithAuth(api.adminMutations.deleteCompany);
  const [editableCompany, setEditableCompany] = useState<Doc<"company"> | null>(
    null,
  );

  // CompanyDialog openstate controls
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (editableCompany) {
      console.log(editableCompany, ":::Company should be null");
      setOpen(true);
    }
  }, [editableCompany]);

  useEffect(() => {
    if (!open) {
      console.log(open, ":::Dialog should be close");
      setEditableCompany(null);
    }
  }, [open]);

  const columns: ColumnDef<Doc<"company">>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Company Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "reward",
      header: "Approved",
      cell: ({ row }) => {
        const isApproved: boolean = row.original?.isApproved;
        if (isApproved)
          return <FaCheckDouble className="h-4 w-4 text-green-500" />;
        return <FaX className="h-4 w-4 text-red-500" />;
      },
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const company = row.original;

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="mb-1 hover:cursor-pointer"
                  onClick={() => {
                    // setEditableTaskIndex(row.index);
                    setEditableCompany(company);
                  }}
                >
                  Edit company
                </DropdownMenuItem>

                {/* <DropdownMenuItem>View customer</DropdownMenuItem> */}
                <DropdownMenuItem
                  className="bg-red-500 hover:cursor-pointer"
                  onClick={async () => {
                    await deleteCompany({ companyId: company._id });
                  }}
                >
                  Delete company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  return (
    <div className="h-full w-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of all companies
          </p>
        </div>
      </div>
      <DataTable
        filterVisible={false}
        data={companies ?? []}
        columns={columns}
        extra={
          <Button
            className="gap-1"
            onClick={() => {
              console.log(editableCompany, ":::Company before new open");
              setOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4 font-bold" /> New company
          </Button>
        }
      />
      <CompanyDialog
        open={open}
        onOpenChange={(open) => setOpen(open)}
        company={editableCompany}
        closeCleanup={() => setEditableCompany(null)}
      />
    </div>
  );
}

interface IEventDialogProps {
  children?: React.ReactNode;
  event: EventType | undefined | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeCleanup: () => void;
}
function EventDialog({
  children,
  event,
  open,
  onOpenChange,
  closeCleanup,
}: IEventDialogProps) {
  // Add task state
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [reward, setReward] = useState<number>();
  const [companyId, setCompanyId] = useState<Id<"company">>();
  const [actions, setActions] =
    useState<
      { name: string; link: string; channel: Network; type: ActionType }[]
    >();
  const [coverStorageId, setCoverStorageId] = useState<Id<"_storage">>();

  const updateEvent = useMutationWithAuth(api.adminMutations.updateEvent);
  const createEvent = useMutationWithAuth(api.adminMutations.createEvent);
  const getCompanies = useQueryWithAuth(api.adminQueries.fetchCompanies, {});
  const generateUploadUrl = useMutationWithAuth(
    api.files.generateUploadUrlForEventCover,
  );
  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    console.log(uploaded, ":::Uploaded event background image");
    setCoverStorageId((uploaded[0]?.response as any)?.storageId);
  };

  useEffect(() => {
    if (event) {
      setTitle(event?.title);
      setReward(event?.reward);
      setCompanyId(event?.companyId);
      setActions(event?.actions);
      setCoverStorageId(event?.coverStorageId);
    }
  }, [event, closeCleanup, open]);

  // Action array dsipatch handler
  function set(key: string, at: number, value: any) {
    const newActions = actions?.map((action, i) => {
      if (i === at) {
        return {
          ...action,
          [key]: value,
          ...(key === "channel" && {
            type: (value === "website"
              ? "visit"
              : value === "twitter"
                ? "follow"
                : "join") as ActionType,
          }),
        };
      } else {
        return action;
      }
    });

    setActions(newActions);
  }

  // company dialog controls
  const [openCompanyDialog, setOpenCompanyDialog] = useState(false);
  useEffect(() => {
    if (companyId === "new") {
      setOpenCompanyDialog(true);
    }
  }, [companyId]);

  useEffect(() => console.log(actions), [actions]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        setTitle("");
        setReward(0);
        setCompanyId(undefined);
        setActions([]);
        closeCleanup();
        onOpenChange(open);
      }}
      key={event?._id}
    >
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-h-full overflow-y-scroll">
        <DialogTitle>{event ? "Edit event" : "Create a new event"}</DialogTitle>
        <div className="grid w-full items-center justify-start gap-2">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              name="title"
              id="title"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div>
            <Label htmlFor="title">Event Description</Label>
            <Textarea
              name="description"
              id="description"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div>
            <Label>Uplaod event cover image</Label>
            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={["image/*"]}
              onUploadComplete={saveAfterUpload}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error as string}`);
              }}
              content={(progress) =>
                progress ? `Uploading... ${progress}%` : "Upload cover"
              }
              className={(progress) =>
                cn(
                  "flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-black hover:cursor-pointer",
                  {
                    "border border-gray-500 bg-background text-white": progress,
                  },
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="reward">Reward</Label>
            <Input
              name="reward"
              id="reward"
              type="number"
              placeholder="Reward"
              value={reward}
              onChange={(event) => setReward(event.target.valueAsNumber)}
              className="max-w-sm"
            />
          </div>
          <div>
            <Label htmlFor="type">Select company</Label>
            <Select
              name="type"
              value={companyId}
              onValueChange={(value: Id<"company">) => {
                setCompanyId(value);
              }}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Companies</SelectLabel>
                  {getCompanies?.map((company) => (
                    <SelectItem
                      disabled={!company?.isApproved}
                      key={company?._id}
                      value={company?._id}
                    >
                      {company?.name}
                    </SelectItem>
                  ))}

                  {/* Launch another modal and create new company, then return here and select it */}

                  <SelectItem value="new">Creat new company</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-10 grid w-full gap-2">
            <div className="flex items-center justify-between">
              <h1 className="font-medium">Actions</h1>
              <Button
                size="sm"
                onClick={() => {
                  setActions([
                    ...(actions ?? []),
                    { name: "", link: "", channel: "discord", type: "join" },
                  ]);
                }}
              >
                Add action
              </Button>
            </div>
            {actions?.map((action, index) => {
              return (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-3 rounded-lg border border-gray-600 p-3"
                >
                  <div>
                    <Label htmlFor="name">Action name</Label>
                    <Input
                      id="name"
                      placeholder="Enter name"
                      value={action?.name}
                      onChange={(e) => set("name", index, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="socials">Channel</Label>
                    <ToggleGroup
                      id="socials"
                      type="single"
                      className="justify-start"
                      // defaultValue={action?.channel}
                      value={action?.channel}
                      onValueChange={(value: Network) => {
                        console.log(value, ":::Network");
                        set("channel", index, value);
                      }}
                    >
                      <ToggleGroupItem
                        value="twitter"
                        aria-label="Toggle twitter"
                      >
                        <FaXTwitter className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="discord"
                        aria-label="Toggle discord"
                      >
                        <FaDiscord className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="telegram"
                        aria-label="Toggle telegram"
                      >
                        <FaTelegram className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="website"
                        aria-label="Toggle website"
                      >
                        <FaGlobe className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div>
                    <Label htmlFor="type">Select action type</Label>
                    <Select
                      name="type"
                      value={action?.type}
                      onValueChange={(value: ActionType) =>
                        set("type", index, value)
                      }
                    >
                      <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Select a action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Type</SelectLabel>
                          {action?.channel === "twitter" && (
                            <SelectItem value="follow">Follow</SelectItem>
                          )}
                          {action?.channel === "twitter" && (
                            <SelectItem value="post">Post</SelectItem>
                          )}
                          {(action?.channel === "discord" ||
                            action?.channel === "telegram") && (
                            <SelectItem value="join">Join</SelectItem>
                          )}
                          {action?.channel === "website" && (
                            <SelectItem value="visit">Visit</SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="link">
                      {action?.channel === "twitter" && action.type === "follow"
                        ? "Account username"
                        : action.channel === "twitter" && action.type === "post"
                          ? "Post Id"
                          : "Link"}
                    </Label>
                    <Input
                      name="link"
                      id="link"
                      placeholder={
                        action?.channel === "twitter" &&
                        action.type === "follow"
                          ? "Account username"
                          : action.channel === "twitter" &&
                              action.type === "post"
                            ? "Post Id"
                            : `${action?.channel} Link`
                      }
                      value={action?.link}
                      onChange={(event) =>
                        set("link", index, event.target.value)
                      }
                      className="max-w-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <DialogClose asChild>
            <Button
              onClick={async () => {
                if (event) {
                  await updateEvent({
                    eventId: event?._id as Id<"events">,
                    title: title as string,
                    coverStorageId: coverStorageId as Id<"_storage">,
                    description: description as string,
                    reward: reward as number,
                    companyId: companyId as Id<"company">,
                    actions: actions
                      ? actions.map(({ name, link, type, channel }) => ({
                          name,
                          link,
                          type,
                          channel,
                        }))
                      : [],
                  });
                } else {
                  if (!actions?.length) {
                    return alert("At least 1 action must be given");
                  }

                  if (!coverStorageId) {
                    return alert("Upload a cover image");
                  }

                  await createEvent({
                    title: title!,
                    coverStorageId: coverStorageId!,
                    description: description!,
                    reward: reward!,
                    companyId: companyId!,
                    actions: actions.map(({ name, link, type, channel }) => ({
                      name,
                      link,
                      type,
                      channel,
                    })),
                  });
                }
              }}
            >
              {event ? "Update" : "Create"}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
      <CompanyDialog
        open={openCompanyDialog}
        onOpenChange={(open) => setOpenCompanyDialog(open)}
        closeCleanup={() => {}}
      />
    </Dialog>
  );
}

interface ICompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Doc<"company"> | undefined | null;
  closeCleanup: () => void;
  // children: React.ReactNode;
}
function CompanyDialog({
  open,
  onOpenChange,
  company,
  closeCleanup,
}: // children,
ICompanyDialogProps) {
  // Creates a new company with uploaded logo and gets the url
  const [name, setName] = useState<string>("");
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [companyLogoStorageId, setCompanyLogoStorageId] =
    useState<Id<"_storage">>();

  const generateUploadUrl = useMutationWithAuth(
    api.files.generateUploadUrlForCompanyLogo,
  );
  const createCompany = useMutationWithAuth(api.adminMutations.createCompany);
  const updateCompany = useMutationWithAuth(api.adminMutations.updateCompany);
  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    setCompanyLogoStorageId((uploaded[0]?.response as any)?.storageId);
  };

  // If event is to update company data
  useEffect(() => {
    // If company is passed in, update state
    if (company) {
      setName(company?.name);
      setIsApproved(company?.isApproved);
      setCompanyLogoStorageId(company?.logoStorageId);
    }
  }, [company, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        console.log("cleanup.....");
        closeCleanup();
        setName("");
        setIsApproved(false);
        setCompanyLogoStorageId(undefined);
        onOpenChange(open);
      }}
    >
      {/* <DialogTrigger asChild>{children}</DialogTrigger>/ */}
      <DialogContent>
        <DialogTitle>Create a new company</DialogTitle>
        <div className="grid w-full items-center justify-start gap-4">
          <div>
            <Label htmlFor="name">Company name</Label>
            <Input
              placeholder="Enter company name"
              className="max-w-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="">
            <Label>Uplaod a company logo, size 1:1</Label>
            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={["image/*"]}
              onUploadComplete={saveAfterUpload}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error as string}`);
              }}
              content={(progress) =>
                progress ? `Uploading... ${progress}%` : "Upload logo"
              }
              className={(progress) =>
                cn(
                  "flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-black hover:cursor-pointer",
                  {
                    "border border-gray-500 bg-background text-white": progress,
                  },
                )
              }
            />
          </div>

          <div className="flex  w-full items-start justify-start gap-2">
            <Checkbox
              id="approve"
              name="approve"
              checked={isApproved}
              onCheckedChange={(state) => setIsApproved(state as boolean)}
            />
            <Label htmlFor="approve">Approve the company</Label>
          </div>

          <DialogClose asChild>
            <Button
              onClick={async () => {
                if (company) {
                  if (!name.length) {
                    return alert("Name is not set");
                  }

                  if (!companyLogoStorageId) {
                    return alert("Upload a company logo to continue");
                  }

                  await updateCompany({
                    companyId: company?._id,
                    name,
                    logoStorageId: companyLogoStorageId,
                    isApproved: isApproved,
                  });
                } else {
                  if (!name.length) {
                    return alert("Name is not set");
                  }

                  if (!companyLogoStorageId) {
                    return alert("Upload a company logo to continue");
                  }

                  await createCompany({
                    logoStorageId: companyLogoStorageId,
                    name,
                    isApproved,
                  });
                }
              }}
            >
              {company ? "Update company" : "Create company"}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
