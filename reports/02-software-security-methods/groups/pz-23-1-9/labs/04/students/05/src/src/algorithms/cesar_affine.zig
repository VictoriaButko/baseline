//! Modified cesar cipher, uses multiply instead of add
//! Key has 2 components: coefficient,base
//! Multiply letter by coefficient and add base
const std = @import("std");
const Io = std.Io;
const util = @import("../util.zig");
const opts = @import("options.zig");

const Key = struct {
    coef: u21,
    base: u21,
};

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;

    for (source) |cp| {
        const crypted: u21 = if (cp >= opts.min_char and cp <= opts.max_char)
            @mod((cp - opts.min_char) * key.coef + key.base, opts.n_chars) + opts.min_char
        else
            cp;

        try sink.print("{u}", .{crypted});
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;

    for (source) |cp| {
        const plain: u21 = if (cp >= opts.min_char and cp <= opts.max_char)
            @intCast(@mod((@as(i32, cp) - opts.min_char - key.base) *
                              util.inversed(key.coef, opts.n_chars).?,
                          opts.n_chars) + opts.min_char)
        else
            cp;

        try sink.print("{u}", .{plain});
    }
    return true;
}

fn getKey(key_str: []const u8) ?Key {
    const sep_i = std.mem.findScalar(u8, key_str, ',') orelse {
        std.debug.print("Key must be in format 'coefficient,base'\n", .{});
        return null;
    };

    const key = Key{
        .coef = std.fmt.parseInt(u8, key_str[0..sep_i], 10) catch {
            std.debug.print("Coefficient needs to be a number\n", .{});
            return null;
        },
        .base = std.fmt.parseInt(u8, key_str[sep_i+1..], 10) catch {
            std.debug.print("Base needs to be a number\n", .{});
            return null;
        },
    };

    if (key.base >= opts.n_chars) {
        std.debug.print("Base ({}) needs to be a in range [{}; {})\n",
                        .{key.base, 0, opts.n_chars});
        return null;
    }
    if (key.coef < 2) {
        std.debug.print("Coefficient must be greater then one\n", .{});
        return null;
    }
    if (myGcd(key.coef, opts.n_chars) != 1) {
        std.debug.print("Coefficient ({}) and number of characters ({}) must be coprime\n",
                        .{key.coef, opts.n_chars});
        return null;
    }

    return key;
}

/// Greatest Common Divisor (there is also std.math.gcd in standard library)
fn myGcd(a: i32, b: i32) i32 {
    return if (a == 0) b else myGcd(@mod(b, a), a);
}
