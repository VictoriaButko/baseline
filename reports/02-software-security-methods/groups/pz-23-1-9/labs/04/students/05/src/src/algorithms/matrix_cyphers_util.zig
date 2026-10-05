// For playfair and polibius cyphers

const std = @import("std");
const Io = std.Io;

pub fn getLetter(cp: u21) ?u21 {
    return if ((cp >= 'a' and cp <= 'z') or (cp >= 'A' and cp <= 'Z'))
        std.ascii.toLower(@intCast(cp))
    else
        null;
}

pub fn makeMatrix(keyword: []const u8) ?[25]u21 {
    var moved: [26]bool = @splat(false);
    var key: [26]u21 = undefined;
    var key_i: usize = 0;

    // Move unique letters from input key to the beginning of key
    for (keyword) |cp| {
        const ch = getLetter(cp) orelse {
            std.debug.print("Key character {u} is not acceptable as key\n", .{cp});
            return null;
        };
        const i = ch - 'a';
        if (!moved[i]) {
            moved[i] = true;
            key[key_i] = ch;
            key_i += 1;
        }
    }
    // Add rest of letters
    for ('a'..'z'+1) |cp| {
        const ch: u8 = @intCast(cp);
        const i = ch - 'a';
        if (!moved[i]) {
            key[key_i] = ch;
            key_i += 1;
        }
    }
    // Merge i and j
    var merged_key: [25]u21 = undefined;
    var found_i: bool = false;
    for ('a'..'z'+1) |i| {
        if (key[i-'a'] == 'i') {
            found_i = true;
            continue;
        }
        merged_key[i-'a'-@intFromBool(found_i)] = key[i-'a'];
    }

    return merged_key;
}

pub fn printMatrix(mat: *const [25]u21) void {
    for (0..5) |i| {
        for (0..5) |j| {
            std.debug.print("{u} ", .{mat.*[i*5 + j]});
        }
        std.debug.print("\n", .{});
    }
}

pub fn matrixIdx(mat: *const [25]u21, in_cp: u21) ?u16 {
    if (getLetter(in_cp)) |in_ch| {
        const ch = if (in_ch == 'i') 'j' else in_ch;
        for (mat, 0..) |mat_ch, i| {
            if (ch == mat_ch) return @intCast(i);
        }
    }
    return null;
}

pub fn matrixYX(mat: *const [25]u21, in_cp: u21) ?struct{u16, u16} {
    const idx = matrixIdx(mat, in_cp) orelse return null;
    return .{idx / 5, idx % 5};
}


const special = 'x';

// Itarate over bigrams, inserting special char between same chars or
// to make entire length even
pub const BigramIter = struct {
    text: []const u21,
    pos: usize,
    ensure_diff: bool, // Ensure letters in bigram are different

    pub fn init(text: []const u21, ensure_diff: bool) BigramIter {
        return .{
            .text = text,
            .pos = 0,
            .ensure_diff = ensure_diff,
        };
    }
    pub fn next(it: *BigramIter) ?[2]u21 {
        var bg: [2]u21 = undefined;

        while (true) {
            defer it.pos += 1;
            if (it.pos >= it.text.len) {
                return null;
            } else if (getLetter(it.text[it.pos])) |ch| {
                bg[0] = ch;
                break;
            }
        }
        while (true) {
            defer it.pos += 1;
            if (it.pos >= it.text.len) {
                bg[1] = special;
                break;
            } else if (getLetter(it.text[it.pos])) |ch| {
                if (it.ensure_diff and ch == bg[0]) {
                    bg[1] = special;
                    it.pos -= 1;
                } else {
                    bg[1] = ch;
                }
                break;
            }
        }
        return bg;
    }
};
