const std = @import("std");
const Io = std.Io;
const util = @import("../util.zig");
const opts = @import("options.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;
    return crypt(key, source, sink);
}

pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getDecrKey(key_str) orelse return false;
    return crypt(key, source, sink);
}

fn crypt(key: [opts.n_chars]u21, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    for (source) |cp| {
        if (cp >= opts.min_char and cp <= opts.max_char) {
            try sink.print("{u}", .{key[cp - opts.min_char]});
        } else {
            try sink.print("{u}", .{cp});
        }
    }
    return true;
}

/// Create map of letter to encrypted
fn getKey(key_str: []const u8) ?[opts.n_chars]u21 {
    var moved: [opts.n_chars]bool = @splat(false);

    var key: [opts.n_chars]u21 = undefined;
    for (0..key.len) |i| key[i] = opts.min_char + @as(u21, @intCast(i));

    var key_i: usize = 0;

    var key_view = std.unicode.Utf8View.init(key_str) catch {
        std.debug.print("Key is not a valid text\n", .{});
        return null;
    };
    var it = key_view.iterator();

    // Move unique letters from input key to the beginning of key
    while (it.nextCodepoint()) |cp| {
        if (cp < opts.min_char or cp > opts.max_char) {
            std.debug.print("Key character {u} is not acceptable as key\n", .{cp});
            return null;
        }
        const i = cp - opts.min_char;
        if (!moved[i]) {
            moved[i] = true;
            key[key_i] = cp;
            key_i += 1;
        }
    }
    // Add rest of letters
    for (0..opts.n_chars) |cp_i| {
        const cp: u21 = @intCast(cp_i + opts.min_char);
        if (!moved[cp_i]) {
            key[key_i] = cp;
            key_i += 1;
        }
    }
    return key;
}

/// Create backward-map: encrypted letter to plain
fn getDecrKey(key_str: []const u8) ?[opts.n_chars]u21 {
    const enc_key = getKey(key_str) orelse return null;
    var key: [opts.n_chars]u21 = undefined;
    for (enc_key, 0..) |cp, i| {
        key[cp - opts.min_char] = @intCast(i + opts.min_char);
    }
    return key;
}
