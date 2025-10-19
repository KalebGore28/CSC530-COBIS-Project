import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { user } from "@/db/schema";
import fuzzysort from "fuzzysort";

type User = typeof user.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

export const GetUsersQuery = graphql(`
    query getUsersQuery {
        user {
            id
            mnumber
            name
            email
            emailVerified
            image
            createdAt
            updatedAt
            isEnabled
            lastLogin
        }
    }
`)

export function findUserMatchFuzzy(input: string, users: User[]): User[] {
    const results = fuzzysort.go(input, users, {
        keys: ["name", (u) => u.mnumber, (u) => u.email],
        threshold: -10000,
        limit: 10,
    });
    // @ts-ignore
    return results.map(result => result.obj);
}

interface UserSearchBoxProps {
    /** Called whenever the selected user changes */
    onSelectChange?: (selected: User | null) => void;
}
export function UserSearchBox({ onSelectChange }: UserSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selected, setSelected] = useState<User | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['getUsers'],
        queryFn: () => execute(GetUsersQuery),
    });

    if (isLoading) return <Skeleton className="h-10 w-full" />;

    const users: User[] = (data?.user ?? []).map(u => ({
        id: u.id,
        mnumber: u.mnumber,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        image: u.image,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        isEnabled: u.isEnabled,
        lastLogin: u.lastLogin
    }));

    if (selected) {
        return (
            <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-muted/30">
                <div>
                    <strong>{selected.mnumber}</strong> — {selected.name}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelected(null);
                        setFilteredUsers([]);
                        setQuery("");
                    }}
                >
                    Remove
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    const results = findUserMatchFuzzy(e.target.value, users);
                    setFilteredUsers(results);
                }}
            />
            <UserResults
                filteredUsers={filteredUsers}
                onSelect={(user) => {
                    setSelected(user);
                    onSelectChange && onSelectChange(user);
                    setFilteredUsers([]);
                    setQuery("");
                }}
            />
        </div>
    );
}

function UserResults({
    filteredUsers,
    onSelect,
}: {
    filteredUsers: User[];
    onSelect: (user: User) => void;
}) {
    if (filteredUsers.length === 0) return null;

    return (
        <ul className="border rounded-md divide-y">
            {filteredUsers.map((user) =>
                user ? (
                    <li
                        key={user.id}
                        className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() =>
                            onSelect({
                                id: user.id,
                                mnumber: user.mnumber,
                                name: user.name,
                                email: user.email,
                                emailVerified: user.emailVerified,
                                image: user.image,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt,
                                isEnabled: user.isEnabled,
                                lastLogin: user.lastLogin
                            })
                        }
                    >
                        <strong>{user.mnumber}</strong> — {user.name}
                    </li>
                ) : null
            )}
        </ul>
    );
}