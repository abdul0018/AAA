import json, subprocess, concurrent.futures as cf
S = json.load(open('shots.json'))['shots']
def job(s):
    out = f"public/clips/s{s['i']:02d}.mp4"
    stretch = 1 / s['rate']
    vf = f"setpts={stretch:.5f}*PTS"
    vf += ",minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if stretch > 1.12 else ",fps=30"
    # c3 is reused 3x: shots 10 and 12 start from different points for variety
    ss = 0.0
    cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-i', f"../flow/clips/{s['src']}.mp4", '-an', '-vf', vf, '-t', str(s['dur'] + 0.1), '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', out]
    subprocess.run(cmd, check=True)
    d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
    return s['i'], round(stretch, 3), d
S = [s for s in S if s['i'] in (2, 6, 7, 8, 9, 12)]
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, S): print(r, flush=True)
