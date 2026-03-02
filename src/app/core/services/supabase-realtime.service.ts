import { Injectable, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseRealtimeService implements OnDestroy {
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(private supabaseService: SupabaseService) {}

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

  removeChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (!channel) return;
    this.supabaseService.getSupabaseClient().removeChannel(channel);
    this.channels.delete(channelName);
  }

  removeAllChannels(): void {
    this.channels.forEach((channel) => {
      this.supabaseService.getSupabaseClient().removeChannel(channel);
    });
    this.channels.clear();
  }

  ngOnDestroy(): void {
    this.removeAllChannels();
  }
}
