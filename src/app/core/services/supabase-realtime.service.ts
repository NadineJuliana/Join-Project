import { Injectable, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * @category Supabase
 * @description Handles realtime channels for Supabase database changes.
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseRealtimeService implements OnDestroy {
  /** Map of active Supabase realtime channels */
  private channels: Map<string, RealtimeChannel> = new Map();

  /** Supabase service injected for database access */
  constructor(private supabaseService: SupabaseService) {}

  /** Create a new realtime channel for a table */
  createChannel<T extends object>(
    table: string,
    channelName: string,
    callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  ): void {
    this.removeChannel(channelName);
    const channel = this.supabaseService
      .getSupabaseClient()
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback(payload as RealtimePostgresChangesPayload<T>);
        },
      )
      .subscribe();
    this.channels.set(channelName, channel);
  }

  /** Remove a specific channel */
  removeChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (!channel) return;
    this.supabaseService.getSupabaseClient().removeChannel(channel);
    this.channels.delete(channelName);
  }

  /** Remove all channels */
  removeAllChannels(): void {
    this.channels.forEach((channel) => {
      this.supabaseService.getSupabaseClient().removeChannel(channel);
    });
    this.channels.clear();
  }

  /** Angular destroy hook to clean up channels */
  ngOnDestroy(): void {
    this.removeAllChannels();
  }
}
